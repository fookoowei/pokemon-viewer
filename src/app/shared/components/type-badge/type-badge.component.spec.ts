import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeBadgeComponent } from './type-badge.component';

describe('TypeBadgeComponent', () => {
  let fixture: ComponentFixture<TypeBadgeComponent>;
  let component: TypeBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TypeBadgeComponent);
    component = fixture.componentInstance;
  });

  it('renders the type name', () => {
    component.type = 'fire';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('fire');
  });

  it('maps a known type to its colour', () => {
    component.type = 'water';
    expect(component.color).toBe('#4d90d5');
  });

  it('falls back to a neutral colour for an unknown type', () => {
    component.type = 'mystery';
    expect(component.color).toBe('#9099a1');
  });
});
