import { Component, Input } from '@angular/core';

/** A spinning Poké Ball used as the app-wide loading indicator. */
@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading…';
}
