import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { PokemonDetailComponent } from './pokemon-detail.component';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { PokemonDetail } from '../../../../core/models/pokemon.model';

const detail: PokemonDetail = {
  id: 6,
  name: 'charizard',
  height: 17,
  weight: 905,
  base_experience: 267,
  sprites: {
    front_default: 'front.png',
    other: { 'official-artwork': { front_default: 'art.png' } },
  },
  types: [{ slot: 1, type: { name: 'fire', url: '' } }],
  abilities: [{ ability: { name: 'blaze', url: '' }, is_hidden: false, slot: 1 }],
  stats: [{ base_stat: 78, effort: 0, stat: { name: 'hp', url: '' } }],
};

describe('PokemonDetailComponent', () => {
  let fixture: ComponentFixture<PokemonDetailComponent>;
  let component: PokemonDetailComponent;
  let serviceSpy: jasmine.SpyObj<PokemonService>;
  let paramMap$: BehaviorSubject<any>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonDetail']);
    serviceSpy.getPokemonDetail.and.returnValue(of(detail));
    paramMap$ = new BehaviorSubject(convertToParamMap({ name: 'charizard' }));

    await TestBed.configureTestingModule({
      declarations: [PokemonDetailComponent],
      providers: [
        { provide: PokemonService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetches the Pokémon named in the route', () => {
    expect(serviceSpy.getPokemonDetail).toHaveBeenCalledWith('charizard');
    expect(component.pokemon?.name).toBe('charizard');
    expect(component.loading).toBeFalse();
  });

  it('converts units and formats the id for display', () => {
    expect(component.paddedId).toBe('#006');
    expect(component.heightMeters).toBe('1.7 m');
    expect(component.weightKg).toBe('90.5 kg');
  });

  it('maps raw stat names to friendly labels', () => {
    expect(component.statLabel('special-attack')).toBe('Sp. Atk');
    expect(component.statLabel('hp')).toBe('HP');
  });

  it('re-fetches when the route param changes', () => {
    serviceSpy.getPokemonDetail.calls.reset();
    serviceSpy.getPokemonDetail.and.returnValue(of({ ...detail, name: 'pikachu' }));
    paramMap$.next(convertToParamMap({ name: 'pikachu' }));

    expect(serviceSpy.getPokemonDetail).toHaveBeenCalledWith('pikachu');
    expect(component.pokemon?.name).toBe('pikachu');
  });

  it('shows a friendly error and clears data when the fetch fails', () => {
    serviceSpy.getPokemonDetail.and.returnValue(
      throwError(() => new Error('We couldn’t find that Pokémon.')),
    );
    component.retry();

    expect(component.error).toBe('We couldn’t find that Pokémon.');
    expect(component.pokemon).toBeNull();
    expect(component.loading).toBeFalse();
  });
});
