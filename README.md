<p align="center"><img src="static/img/logo.png" alt="Opsburg" width="96"></p>

# Opsburg documentation

Source of [opsburg.dev/documentation](https://opsburg.dev/documentation/), the documentation of Opsburg. Docusaurus 3, themed with the tokens and fonts of the [Opsburg design system](https://opsburg.dev/design-system/), light and dark.

## Develop

```bash
pnpm install
pnpm start       # http://localhost:3000/documentation/
pnpm typecheck
pnpm build       # static site in ./build, with llms.txt and llms-full.txt
pnpm serve       # serve ./build locally
```

`pnpm build` fails on broken links and anchors, so a moved page cannot leave dead links behind. It reads page dates from git, so the repository needs at least one commit.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: typecheck, build and publish `./build` to GitHub Pages. Pull requests only build. The organization site owns the `opsburg.dev` custom domain, so this repository's Pages are served at `opsburg.dev/documentation/`.

## Where things live

- `docs/`: the pages. The sidebar is generated from the folders: `sidebar_position` in each page's front matter orders pages, `position` in `_category_.json` orders sections. Every page needs a `description`: it becomes the meta description and the line in `llms.txt`.
- `src/css/custom.css`: the theme. The design system's semantic tokens (palette Ottone e Notte) mapped onto Infima variables, for both color modes.
- `src/fonts/`: Cinzel, IBM Plex Sans and IBM Plex Mono, copied from `@opsburg/design-system` (SIL OFL 1.1).
- `src/pages/index.tsx`: the documentation home page.
- `src/theme/`: wrappers that add structured data (TechArticle, CollectionPage, BreadcrumbList) to doc pages.
- `plugins/llms-txt.ts`: writes `llms.txt`, `llms-full.txt` and a `.md` copy of every page at build time.

## Writing

English, plain sentences, no em dashes. On first mention, give the game name and then what it is: "the city, that is the organization". Document only what the released version does.
