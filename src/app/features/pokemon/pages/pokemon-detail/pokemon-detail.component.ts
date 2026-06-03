import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { PokemonService } from '../../../../core/services/pokemon.service';
import { getArtwork, PokemonDetail } from '../../../../core/models/pokemon.model';
import { typeColor } from '../../../../core/models/pokemon-type-colors';

/**
 * Smart component for a single Pokémon. Reads the `:name` route param, fetches
 * full detail, and renders types, abilities and stats with loading/error
 * states. Re-fetches automatically when the param changes (e.g. navigating
 * between Pokémon).
 */
@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss'],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  pokemon: PokemonDetail | null = null;
  loading = true;
  error: string | null = null;

  private name = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.name = params.get('name') ?? '';
      this.fetch();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retry(): void {
    this.fetch();
  }

  // --- View helpers -------------------------------------------------------

  get artwork(): string {
    return this.pokemon ? getArtwork(this.pokemon) : '';
  }

  get paddedId(): string {
    return this.pokemon ? '#' + this.pokemon.id.toString().padStart(3, '0') : '';
  }

  /** Height in metres (API gives decimetres). */
  get heightMeters(): string {
    return this.pokemon ? (this.pokemon.height / 10).toFixed(1) + ' m' : '';
  }

  /** Weight in kilograms (API gives hectograms). */
  get weightKg(): string {
    return this.pokemon ? (this.pokemon.weight / 10).toFixed(1) + ' kg' : '';
  }

  /** Type-tinted hero gradient driven by the primary type. */
  get heroBackground(): string {
    const primary = this.pokemon?.types[0]?.type.name ?? 'normal';
    const c = typeColor(primary);
    return `linear-gradient(150deg, ${c}, ${c}b3)`;
  }

  /** Human-friendly stat label (e.g. "special-attack" -> "Sp. Atk"). */
  statLabel(raw: string): string {
    const map: Record<string, string> = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    };
    return map[raw] ?? raw;
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.pokemonService
      .getPokemonDetail(this.name)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (p) => (this.pokemon = p),
        error: (err: Error) => {
          this.error = err.message;
          this.pokemon = null;
        },
      });
  }
}
