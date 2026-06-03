import { Component, Input } from '@angular/core';

/**
 * A labelled progress bar for a single base stat (HP, Attack, …).
 * The fill width and colour are derived from the value so weak/strong stats
 * read at a glance.
 */
@Component({
  selector: 'app-stat-bar',
  templateUrl: './stat-bar.component.html',
  styleUrls: ['./stat-bar.component.scss'],
})
export class StatBarComponent {
  @Input() label = '';
  @Input() value = 0;
  /** Highest base stat in the games; used to scale the bar to 100%. */
  @Input() max = 200;

  get percent(): number {
    return Math.min(100, Math.round((this.value / this.max) * 100));
  }

  get barColor(): string {
    if (this.value < 50) return '#e0556b'; // weak  -> red
    if (this.value < 90) return '#f0a23b'; // mid   -> amber
    return '#5bbf6a'; // strong -> green
  }
}
