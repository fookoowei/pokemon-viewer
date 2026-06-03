import { Component, Input } from '@angular/core';
import { PokemonListItem } from '../../../core/models/pokemon.model';
import { typeColor } from '../../../core/models/pokemon-type-colors';

/**
 * Presentational card for the list grid: sprite, padded id, name and type
 * chips. Tinted with the Pokémon's primary type colour. Purely @Input-driven
 * so it's trivial to test and reuse.
 */
@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
})
export class PokemonCardComponent {
  @Input() pokemon!: PokemonListItem;

  get primaryType(): string {
    return this.pokemon.types[0] ?? 'normal';
  }

  /** Soft type-tinted gradient backdrop for the sprite area. */
  get tint(): string {
    const c = typeColor(this.primaryType);
    return `linear-gradient(160deg, ${c}2e, ${c}10)`;
  }

  get paddedId(): string {
    return '#' + this.pokemon.id.toString().padStart(3, '0');
  }
}
