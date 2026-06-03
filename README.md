# Pokédex — Pokémon Viewer

A responsive Pokémon viewer built with **Angular 15** that consumes the public
[PokeAPI](https://pokeapi.co/docs/v2). Browse and search every Pokémon, then open
any one to see its types, abilities and base stats.

## Features

- **Browse** — paginated, responsive grid of Pokémon cards (sprite, id, name, types).
- **Search** — instant, case-insensitive search by name.
- **Details** — per-Pokémon page with types, abilities (incl. hidden), base stats,
  height, weight and base experience.
- **Responsive** — CSS Grid layout that reflows from desktop to mobile.
- **Graceful errors** — friendly messages and a *Try again* action on any API failure.
- **Tested** — unit tests for the data service and key components.
- **Shareable URLs** — search term and page live in the query string
  (`/pokemon?search=pika&page=2`), so views are bookmarkable.

## Tech stack

- Angular 15 (modules + lazy-loaded feature)
- TypeScript
- RxJS (`HttpClient`, `forkJoin`, `switchMap`, `shareReplay`)
- SCSS with CSS variables (no UI framework)
- Karma + Jasmine

## Getting started

```bash
npm install
npm start          # ng serve -> http://localhost:4200
```

## Scripts

```bash
npm start          # dev server with live reload
npm run build      # production build into dist/
npm test           # unit tests (Karma + Jasmine)
```

## Project structure

```
src/app/
├── core/                      # app-wide singletons (load once)
│   ├── models/                # typed PokeAPI contracts + type colours
│   ├── services/              # PokemonService — the only place that calls the API
│   └── interceptors/          # ErrorInterceptor — centralised HTTP error mapping
├── features/pokemon/          # lazy-loaded feature module
│   └── pages/
│       ├── pokemon-list/      # search + pagination + data
│       └── pokemon-detail/    # one Pokémon's full detail
└── shared/                    # reusable presentational components
    └── components/            # pokemon-card, type-badge, stat-bar,
                               #   loading-spinner, error-message
```

PokeAPI has no search endpoint, so `PokemonService` fetches the full name index
once (cached with `shareReplay`), filters/paginates it in memory, and hydrates
only the visible page's Pokémon in parallel with `forkJoin`.
