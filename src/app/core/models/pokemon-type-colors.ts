/**
 * Canonical colour for each Pokémon type. Used to theme cards, badges and the
 * detail hero so the UI feels authentically "Pokédex" without hard-coding
 * colours all over the templates.
 */
export const TYPE_COLORS: Readonly<Record<string, string>> = {
  normal: '#9099a1',
  fire: '#ff9d55',
  water: '#4d90d5',
  electric: '#f3d23b',
  grass: '#63bb5b',
  ice: '#73cec0',
  fighting: '#ce4069',
  poison: '#ab6ac8',
  ground: '#d97746',
  flying: '#8fa8dd',
  psychic: '#fa7179',
  bug: '#90c12c',
  rock: '#c7b78b',
  ghost: '#5269ac',
  dragon: '#0b6dc3',
  dark: '#5a5366',
  steel: '#5a8ea1',
  fairy: '#ec8fe6',
};

const FALLBACK = '#9099a1';

/** Returns the colour for a type name, falling back to a neutral grey. */
export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? FALLBACK;
}
