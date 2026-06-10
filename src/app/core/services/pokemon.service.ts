import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import {
  NamedApiResource,
  PokemonDetail,
  PokemonIndexResponse,
  PokemonListItem,
  PokemonPage,
  refToListItem,
  toListItem,
} from '../models/pokemon.model';

/**
 * Single gateway to the PokeAPI. All HTTP access to Pokémon data goes through
 * here, which keeps components free of URLs and makes the data layer trivial
 * to mock in tests.
 *
 * Strategy for list + search:
 *   The PokeAPI has no search endpoint, so we fetch the full (lightweight)
 *   name index once, cache it with shareReplay, then filter/paginate it in
 *   memory. Each page paints instantly from the index (id + artwork are
 *   derived from the url, no request); type badges are then hydrated in the
 *   background via per-Pokémon detail requests, which are cached so paging
 *   back or opening a card never refetches.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  /** Cached, shared stream of every Pokémon's { name, url }. */
  private nameIndex$?: Observable<NamedApiResource[]>;

  /** Per-Pokémon detail cache so paging back and opening a card never refetch. */
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();

  constructor(private readonly http: HttpClient) {}

  /** The full Pokémon name index, fetched once and replayed to all callers. */
  getNameIndex(): Observable<NamedApiResource[]> {
    if (!this.nameIndex$) {
      this.nameIndex$ = this.http
        .get<PokemonIndexResponse>(`${this.baseUrl}/pokemon`, {
          params: { limit: 100000, offset: 0 },
        })
        .pipe(
          map((res) => res.results),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.nameIndex$;
  }

  /**
   * Full detail for one Pokémon by id or (lowercase) name. Cached and shared:
   * repeat requests for the same Pokémon (paging back, opening its card) reuse
   * the first response. Failures are evicted so `retry()` can refetch.
   */
  getPokemonDetail(idOrName: string | number): Observable<PokemonDetail> {
    const key = String(idOrName).toLowerCase();
    let cached = this.detailCache.get(key);
    if (!cached) {
      cached = this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${idOrName}`).pipe(
        catchError((err) => {
          this.detailCache.delete(key); // don't cache failures
          return throwError(() => err);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.detailCache.set(key, cached);
    }
    return cached;
  }

  /**
   * Returns one page of list cards, optionally filtered by a search term.
   *
   * @param search   case-insensitive substring match on the name ('' = all)
   * @param page     1-based page number
   * @param pageSize cards per page
   */
  getPokemonPage(search: string, page: number, pageSize: number): Observable<PokemonPage> {
    const term = search.trim().toLowerCase();

    return this.getNameIndex().pipe(
      switchMap((all) => {
        const filtered = term ? all.filter((p) => p.name.includes(term)) : all;
        const total = filtered.length;

        const start = (page - 1) * pageSize;
        const slice = filtered.slice(start, start + pageSize);

        if (slice.length === 0) {
          return of<PokemonPage>({ items: [], total });
        }

        // 1) Instant page straight from the cached index — id + image need no
        //    request, so the grid paints immediately without waiting on detail.
        const base: PokemonListItem[] = slice.map(refToListItem);

        // 2) Hydrate type badges in the background, all in parallel. A single
        //    failed Pokémon falls back to its base card instead of breaking
        //    the whole page (forkJoin would otherwise error out).
        const hydrated$ = forkJoin(
          slice.map((ref, i) =>
            this.getPokemonDetail(ref.name).pipe(
              map(toListItem),
              catchError(() => of(base[i])),
            ),
          ),
        ).pipe(map((items) => ({ items, total })));

        return concat(of<PokemonPage>({ items: base, total }), hydrated$);
      }),
    );
  }
}
