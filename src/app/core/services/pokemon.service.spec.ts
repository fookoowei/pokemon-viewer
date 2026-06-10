import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { PokemonService } from './pokemon.service';
import { PokemonDetail } from '../models/pokemon.model';

/** Minimal detail payload factory for tests. */
function makeDetail(id: number, name: string): PokemonDetail {
  return {
    id,
    name,
    height: 7,
    weight: 69,
    base_experience: 112,
    sprites: {
      front_default: `front-${name}.png`,
      other: { 'official-artwork': { front_default: `art-${name}.png` } },
    },
    types: [{ slot: 1, type: { name: 'grass', url: '' } }],
    abilities: [{ ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 }],
    stats: [{ base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } }],
  };
}

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  const base = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokemonService],
    });
    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPokemonDetail() requests the correct URL', () => {
    const detail = makeDetail(1, 'bulbasaur');
    let result: PokemonDetail | undefined;

    service.getPokemonDetail('bulbasaur').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${base}/pokemon/bulbasaur`);
    expect(req.request.method).toBe('GET');
    req.flush(detail);

    expect(result).toEqual(detail);
  });

  it('getNameIndex() is fetched once and cached (shareReplay)', () => {
    const index = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: `${base}/pokemon/1/` },
        { name: 'ivysaur', url: `${base}/pokemon/2/` },
      ],
    };

    service.getNameIndex().subscribe();
    service.getNameIndex().subscribe();

    // Only ONE network call despite two subscriptions (expectOne throws if not).
    const reqs = httpMock.match((r) => r.url === `${base}/pokemon`);
    expect(reqs.length).toBe(1);
    reqs[0].flush(index);
  });

  it('getPokemonPage() filters by search and hydrates the page in parallel', () => {
    const index = {
      count: 3,
      next: null,
      previous: null,
      results: [
        { name: 'pikachu', url: `${base}/pokemon/25/` },
        { name: 'raichu', url: `${base}/pokemon/26/` },
        { name: 'bulbasaur', url: `${base}/pokemon/1/` },
      ],
    };

    let page: { items: any[]; total: number } | undefined;
    service.getPokemonPage('chu', 1, 24).subscribe((p) => (page = p));

    httpMock.expectOne((r) => r.url === `${base}/pokemon`).flush(index);

    // Two matches for "chu" -> two detail requests.
    httpMock.expectOne(`${base}/pokemon/pikachu`).flush(makeDetail(25, 'pikachu'));
    httpMock.expectOne(`${base}/pokemon/raichu`).flush(makeDetail(26, 'raichu'));

    expect(page?.total).toBe(2);
    expect(page?.items.length).toBe(2);
    expect(page?.items[0].name).toBe('pikachu');
    expect(page?.items[0].image).toBe('art-pikachu.png');
  });

  it('getPokemonDetail() caches the result — repeat calls reuse one request', () => {
    const detail = makeDetail(1, 'bulbasaur');

    service.getPokemonDetail('bulbasaur').subscribe();
    service.getPokemonDetail('bulbasaur').subscribe();

    // Cached: only ONE network call despite two subscriptions.
    const reqs = httpMock.match(`${base}/pokemon/bulbasaur`);
    expect(reqs.length).toBe(1);
    reqs[0].flush(detail);
  });

  it('getPokemonPage() emits an instant index-derived page, then hydrates types', () => {
    const index = {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'pikachu', url: `${base}/pokemon/25/` }],
    };

    const emissions: Array<{ items: any[]; total: number }> = [];
    service.getPokemonPage('', 1, 24).subscribe((p) => emissions.push(p));

    httpMock.expectOne((r) => r.url === `${base}/pokemon`).flush(index);

    // First emission is immediate: id + image from the index, no detail yet.
    expect(emissions.length).toBe(1);
    expect(emissions[0].items[0].name).toBe('pikachu');
    expect(emissions[0].items[0].image).toContain('official-artwork/25.png');
    expect(emissions[0].items[0].types).toEqual([]);

    // Background hydration then fills in the type badges.
    httpMock.expectOne(`${base}/pokemon/pikachu`).flush(makeDetail(25, 'pikachu'));
    expect(emissions.length).toBe(2);
    expect(emissions[1].items[0].types).toEqual(['grass']);
  });

  it('getPokemonPage() survives a failed detail request, keeping the base card', () => {
    const index = {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'pikachu', url: `${base}/pokemon/25/` }],
    };

    let last: { items: any[]; total: number } | undefined;
    service.getPokemonPage('', 1, 24).subscribe((p) => (last = p));

    httpMock.expectOne((r) => r.url === `${base}/pokemon`).flush(index);
    httpMock
      .expectOne(`${base}/pokemon/pikachu`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    // Card still shown (name + derived image), just without types — no crash.
    expect(last?.items.length).toBe(1);
    expect(last?.items[0].name).toBe('pikachu');
    expect(last?.items[0].image).toContain('official-artwork/25.png');
    expect(last?.items[0].types).toEqual([]);
  });

  it('getPokemonPage() returns an empty page when nothing matches', () => {
    const index = {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'pikachu', url: `${base}/pokemon/25/` }],
    };

    let page: { items: any[]; total: number } | undefined;
    service.getPokemonPage('zzz', 1, 24).subscribe((p) => (page = p));

    httpMock.expectOne((r) => r.url === `${base}/pokemon`).flush(index);

    // No detail requests should be made.
    httpMock.expectNone(`${base}/pokemon/pikachu`);
    expect(page).toEqual({ items: [], total: 0 });
  });
});
