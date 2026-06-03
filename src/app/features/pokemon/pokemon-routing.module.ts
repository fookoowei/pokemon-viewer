import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PokemonListComponent } from './pages/pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './pages/pokemon-detail/pokemon-detail.component';

/** Routes for the Pokémon feature (mounted at /pokemon by the app router). */
const routes: Routes = [
  { path: '', component: PokemonListComponent, title: 'Pokédex' },
  { path: ':name', component: PokemonDetailComponent, title: 'Pokémon details' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonRoutingModule {}
