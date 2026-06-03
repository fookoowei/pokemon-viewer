import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PokemonCardComponent } from './components/pokemon-card/pokemon-card.component';
import { TypeBadgeComponent } from './components/type-badge/type-badge.component';
import { StatBarComponent } from './components/stat-bar/stat-bar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';

/**
 * Reusable, presentational building blocks shared across feature modules.
 * Declares and re-exports the dumb components plus the common modules they need
 * so feature modules only import SharedModule.
 */
@NgModule({
  declarations: [
    PokemonCardComponent,
    TypeBadgeComponent,
    StatBarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    CommonModule,
    PokemonCardComponent,
    TypeBadgeComponent,
    StatBarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
})
export class SharedModule {}
