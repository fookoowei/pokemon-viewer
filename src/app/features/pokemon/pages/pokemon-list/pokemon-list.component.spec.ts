import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { PokemonListComponent } from './pokemon-list.component';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { PokemonPage } from '../../../../core/models/pokemon.model';

describe('PokemonListComponent', () => {
  let fixture: ComponentFixture<PokemonListComponent>;
  let component: PokemonListComponent;
  let serviceSpy: jasmine.SpyObj<PokemonService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let queryParams$: BehaviorSubject<Record<string, string>>;

  const page: PokemonPage = {
    total: 50,
    items: [{ id: 1, name: 'bulbasaur', image: 'b.png', types: ['grass'] }],
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonPage']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    queryParams$ = new BehaviorSubject<Record<string, string>>({});

    serviceSpy.getPokemonPage.and.returnValue(of(page));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PokemonListComponent],
      providers: [
        { provide: PokemonService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('loads the first page on init', () => {
    expect(serviceSpy.getPokemonPage).toHaveBeenCalledWith('', 1, component.pageSize);
    expect(component.items.length).toBe(1);
    expect(component.total).toBe(50);
    expect(component.loading).toBeFalse();
  });

  it('computes the total number of pages from the total and pageSize', () => {
    expect(component.totalPages).toBe(Math.ceil(50 / component.pageSize));
  });

  it('refetches when the URL query params change', () => {
    serviceSpy.getPokemonPage.calls.reset();
    queryParams$.next({ search: 'pika', page: '2' });

    expect(component.search).toBe('pika');
    expect(component.page).toBe(2);
    expect(serviceSpy.getPokemonPage).toHaveBeenCalledWith('pika', 2, component.pageSize);
  });

  it('typing in the search box navigates with the term and resets to page 1', fakeAsync(() => {
    component.searchControl.setValue('char');
    tick(350); // debounceTime

    expect(routerSpy.navigate).toHaveBeenCalled();
    const args = routerSpy.navigate.calls.mostRecent().args[1];
    expect(args?.queryParams).toEqual(jasmine.objectContaining({ search: 'char', page: 1 }));
  }));

  it('goToPage() ignores out-of-range pages', () => {
    routerSpy.navigate.calls.reset();
    component.page = 1;
    component.goToPage(0);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('surfaces a friendly error when the service fails', () => {
    serviceSpy.getPokemonPage.and.returnValue(throwError(() => new Error('Boom')));
    component.retry();

    expect(component.error).toBe('Boom');
    expect(component.loading).toBeFalse();
  });
});
