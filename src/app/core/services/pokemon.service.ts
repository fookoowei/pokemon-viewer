import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import {
  NamedApiResource,
  PokemonDetail,
  PokemonIndexResponse,
  PokemonPage,
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
 *   memory. Only the ~24 Pokémon on the current page are hydrated with a
 *   detail request (run in parallel via forkJoin) to get image + types.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  /** Cached, shared stream of every Pokémon's { name, url }. */
  private nameIndex$?: Observable<NamedApiResource[]>;

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

  /** Full detail for one Pokémon by id or (lowercase) name. */
  getPokemonDetail(idOrName: string | number): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${idOrName}`);
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

        // Hydrate just this page's Pokémon, all requests in parallel.
        return forkJoin(slice.map((ref) => this.getPokemonDetail(ref.name))).pipe(
          map((details) => ({ items: details.map(toListItem), total })),
        );
      }),
    );
  }
}
