import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PokemonCardComponent } from './pokemon-card.component';
import { TypeBadgeComponent } from '../type-badge/type-badge.component';
import { RouterLinkStubDirective } from '../../testing/router-link-stub.directive';
import { PokemonListItem } from '../../../core/models/pokemon.model';

describe('PokemonCardComponent', () => {
  let fixture: ComponentFixture<PokemonCardComponent>;
  let component: PokemonCardComponent;

  const sample: PokemonListItem = {
    id: 25,
    name: 'pikachu',
    image: 'pikachu.png',
    types: ['electric'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonCardComponent, TypeBadgeComponent, RouterLinkStubDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
    component.pokemon = sample;
    fixture.detectChanges();
  });

  it('pads the id to three digits with a hash', () => {
    expect(component.paddedId).toBe('#025');
  });

  it('exposes the primary type', () => {
    expect(component.primaryType).toBe('electric');
  });

  it('renders the name, sprite and a type badge', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card__name')?.textContent).toContain('pikachu');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('pikachu.png');
    expect(el.querySelector('app-type-badge')).toBeTruthy();
  });

  it('links to the detail route for the Pokémon', () => {
    const link = fixture.debugElement
      .query(By.directive(RouterLinkStubDirective))
      .injector.get(RouterLinkStubDirective);
    expect(link.linkParams).toEqual(['/pokemon', 'pikachu']);
  });
});
