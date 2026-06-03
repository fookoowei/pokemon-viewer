import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Centralised HTTP error handling. Converts low-level HttpErrorResponse objects
 * into Error instances carrying a friendly, user-facing message so components
 * can simply read `err.message`. Doing this once here keeps every component's
 * error handling consistent.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new Error(this.toFriendlyMessage(error))),
      ),
    );
  }

  private toFriendlyMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error — please check your connection and try again.';
    }
    if (error.status === 404) {
      return 'We couldn’t find that Pokémon. Try another name or ID.';
    }
    if (error.status >= 500) {
      return 'The Pokémon service is having a moment. Please try again shortly.';
    }
    return 'Something went wrong while loading Pokémon. Please try again.';
  }
}
