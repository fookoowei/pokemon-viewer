import { Component, Input } from '@angular/core';
import { typeColor } from '../../../core/models/pokemon-type-colors';

/** A small colour-coded chip showing a single Pokémon type. */
@Component({
  selector: 'app-type-badge',
  template: `
    <span class="badge capitalize" [style.background-color]="color">{{ type }}</span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: #fff;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
      }
    `,
  ],
})
export class TypeBadgeComponent {
  @Input() type = '';

  get color(): string {
    return typeColor(this.type);
  }
}
