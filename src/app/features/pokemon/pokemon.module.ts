import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { PokemonRoutingModule } from './pokemon-routing.module';
import { PokemonListComponent } from './pages/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './pages/pokemon-detail/pokemon-detail.component';

/**
 * Feature module for the Pokémon viewer. Lazy-loaded by the app router so its
 * code (and the page components) only ship when the user visits /pokemon.
 */
@NgModule({
  declarations: [PokemonListComponent, PokemonDetailComponent],
  imports: [SharedModule, ReactiveFormsModule, PokemonRoutingModule],
})
export class PokemonModule {}
