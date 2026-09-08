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

## Contact form

The contact form (`#contact-form` in `index.html`) submits via
[Formspree](https://formspree.io) — this is a static site with no server, so
Formspree is the delivery backend. It's connected to
`https://formspree.io/f/mwlkrddz`, which forwards submissions to
`contact.smt.enterprises@gmail.com`. Formspree reads the field named `email`
and uses it as the Reply-To on the notification it sends, so replying from
Gmail reaches the visitor directly. A hidden `_gotcha` field acts as a
honeypot (Formspree silently discards submissions where it's non-empty), and
a hidden `_subject` field gives the notification email a readable subject
line.

The endpoint ID is a public identifier, not a secret — Formspree's model is
designed for it to live in client-side code. No password, API key or SMTP
credential is ever placed in this repository. Client-side submission was
verified against the live endpoint (Formspree responded `200 {"ok":true}`);
actual inbox delivery should be confirmed by checking
`contact.smt.enterprises@gmail.com`.

To point the form at a different Formspree form, replace
`CONTACT_FORM_ENDPOINT` in `src/main.ts`.

## Before going live

A few placeholders should be replaced with real values:

- Canonical/OG URLs (`https://www.smtenterprises.com/`) in `index.html`,
  `public/robots.txt` and `public/sitemap.xml`.
- Add real social links to the footer if/when accounts exist (intentionally
  omitted for now rather than linking to placeholders).

Contact email is `contact.smt.enterprises@gmail.com`, used throughout
`index.html`. The brand logo is loaded from
`public/images/smt-enterprises-logo.png` — see `public/images/README.md`
for how that file relates to the original asset in `source-assets/`. If it's
ever missing, the site falls back to a plain text wordmark automatically —
no build step required either way.

## Animation fallback

The entrance-animation system (`src/style.css`, "Animation system" comment
block) is opt-in: every element is fully visible by default, and only
`src/main.ts` — as its own first action — adds the class that allows
anything to be hidden pending its entrance transition. If the script never
runs at all (network failure, blocked, a syntax error), nothing is ever
hidden in the first place. If it starts but throws partway through, the
`catch` block force-reveals everything immediately; a small inline script in
`<head>` also does this on a timeout as a last-resort safety net. This was
verified by blocking the module script outright in a real browser and
confirming the page still renders fully, immediately.
