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
