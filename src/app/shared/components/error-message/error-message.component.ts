import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Friendly inline error state with an optional "Try again" action.
 * Emitting `retry` lets the parent decide how to re-fetch, keeping this
 * component purely presentational.
 */
@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent {
  @Input() message = 'Something went wrong.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
