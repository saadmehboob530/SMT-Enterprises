# SMT Enterprises

Marketing website for SMT Enterprises — a technology company building modern
websites, e-commerce platforms, custom software, SaaS products and AI-powered
automation.

## Stack

Vanilla TypeScript + [Vite](https://vitejs.dev), no UI framework. The site is
a single static page (`index.html`) styled with plain CSS (`src/style.css`,
design tokens as CSS custom properties) and a small amount of interactivity
(`src/main.ts`: mobile nav, header scroll state, scroll-reveal animations).

## Development

```bash
npm install
npm run dev        # start the dev server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

## Deployment (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds the site and deploys
`dist/` to GitHub Pages on every push to `main`. In the repository settings,
set **Settings → Pages → Source** to **GitHub Actions**. `vite.config.ts`
uses a relative `base: './'` so the build works whether the site is served
from the domain root or a `/<repo-name>/` project path.

## Before going live

A few placeholders should be replaced with real values:

- Contact email (`hello@smtenterprises.com`) throughout `index.html`.
- Canonical/OG URLs (`https://www.smtenterprises.com/`) in `index.html`,
  `public/robots.txt` and `public/sitemap.xml`.
- Add real social links to the footer if/when accounts exist (intentionally
  omitted for now rather than linking to placeholders).
