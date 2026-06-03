import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PokemonService } from '../../../../core/services/pokemon.service';
import { PokemonListItem, PokemonPage } from '../../../../core/models/pokemon.model';

const EMPTY_PAGE: PokemonPage = { items: [], total: 0 };

/**
 * Smart component for the list screen. Owns the data fetching, search and
 * pagination. The URL query params (`?search=&page=`) are the single source of
 * truth, so the view is shareable/bookmarkable and the back button works.
 *
 * Data flow:
 *   search box --(debounce)--> URL --> trigger$ --(switchMap)--> service --> view
 */
@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss'],
})
export class PokemonListComponent implements OnInit, OnDestroy {
  readonly pageSize = 24;

  readonly searchControl = new FormControl('', { nonNullable: true });

  items: PokemonListItem[] = [];
  total = 0;
  page = 1;
  search = '';
  loading = true;
  error: string | null = null;

  /** Emits whenever we need to (re)fetch a page — drives the data pipeline. */
  private readonly trigger$ = new BehaviorSubject<{ search: string; page: number }>({
    search: '',
    page: 1,
  });
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  ngOnInit(): void {
    // 1) Typing in the search box updates the URL (resetting to page 1).
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.navigate({ search: term || null, page: 1 }));

    // 2) URL changes feed the data trigger and keep the box in sync.
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const search = (params['search'] as string) ?? '';
      const page = Number(params['page']) || 1;

      this.search = search;
      this.page = page;
      if (this.searchControl.value !== search) {
        this.searchControl.setValue(search, { emitEvent: false });
      }
      this.trigger$.next({ search, page });
    });

    // 3) The trigger fetches data; switchMap cancels superseded requests.
    this.trigger$
      .pipe(
        tap(() => {
          this.loading = true;
          this.error = null;
        }),
        switchMap(({ search, page }) =>
          this.pokemonService.getPokemonPage(search, page, this.pageSize).pipe(
            catchError((err: Error) => {
              this.error = err.message;
              return of(EMPTY_PAGE);
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((result) => {
        this.items = result.items;
        this.total = result.total;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.navigate({ page });
    // Scroll back to the top so the new page starts at the first card.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retry(): void {
    this.trigger$.next({ search: this.search, page: this.page });
  }

  trackById(_index: number, item: PokemonListItem): number {
    return item.id;
  }

  /** Merge-navigate so we only touch the params we pass. */
  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
