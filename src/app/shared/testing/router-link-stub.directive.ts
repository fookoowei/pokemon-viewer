import { Directive, HostListener, Input } from '@angular/core';

/**
 * Test double for Angular's `routerLink`. Lets specs assert *where* a link
 * points without booting a real router — which avoids Karma's
 * "full page reload" detector firing on rendered anchors.
 *
 * Based on the pattern from the official Angular testing guide.
 */
@Directive({ selector: '[routerLink]' })
export class RouterLinkStubDirective {
  @Input('routerLink') linkParams: unknown;
  navigatedTo: unknown = null;

  @HostListener('click')
  onClick(): void {
    this.navigatedTo = this.linkParams;
  }
}
