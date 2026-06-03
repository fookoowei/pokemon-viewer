/**
 * Type definitions for the slice of the PokeAPI (https://pokeapi.co/docs/v2)
 * this app consumes. Keeping these in one place gives us a typed contract
 * between the HTTP layer and the UI.
 */

/** Generic { name, url } reference used throughout the PokeAPI. */
export interface NamedApiResource {
  name: string;
  url: string;
}

/** Response shape of GET /pokemon (the paginated index endpoint). */
export interface PokemonIndexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonAbilitySlot {
  ability: NamedApiResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

/** Response shape of GET /pokemon/{idOrName} (the detail endpoint). */
export interface PokemonDetail {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  base_experience: number;
  sprites: PokemonSprites;
  types: PokemonTypeSlot[];
  abilities: PokemonAbilitySlot[];
  stats: PokemonStat[];
}

/**
 * Flattened, view-friendly model for a card in the list grid.
 * Derived from PokemonDetail so the template stays simple.
 */
export interface PokemonListItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

/** One page of results plus the total count of the (possibly filtered) set. */
export interface PokemonPage {
  items: PokemonListItem[];
  total: number;
}

/** Best available artwork for a Pokémon, with graceful fallbacks. */
export function getArtwork(detail: PokemonDetail): string {
  return (
    detail.sprites.other?.['official-artwork']?.front_default ??
    detail.sprites.front_default ??
    ''
  );
}

/** Map a full detail payload to the lightweight list-card model. */
export function toListItem(detail: PokemonDetail): PokemonListItem {
  return {
    id: detail.id,
    name: detail.name,
    image: getArtwork(detail),
    types: detail.types.map((t) => t.type.name),
  };
}
