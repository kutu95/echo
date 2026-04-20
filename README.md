# Canine Echo Helper

Chairside **React / Next.js (App Router)** tool for entering canine echocardiography linear measurements, viewing **decision-support** interpretations (not diagnoses), and reviewing **how-to-measure** guidance with **inline SVG schematics**.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm

## Setup

```bash
cd Echo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A **demo case** is written to `localStorage` the first time the app loads in a browser.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Local development server |
| `npm run build`| Production build         |
| `npm run start`| Run production build     |
| `npm run lint` | ESLint                   |

## Project layout

| Path | Purpose |
| ---- | ------- |
| `app/` | App Router pages (`/`, `/guides`) |
| `components/` | UI including `EchoApp`, inputs, report, diagrams |
| `lib/calculations.ts` | LA:Ao, FS%, E:A, sanity checks |
| `lib/interpretation.ts` | Rules-based pattern prompts + safety copy |
| `lib/schemas.ts` | Zod schemas for forms |
| `lib/case-storage.ts` | `localStorage` persistence |
| `data/measurementGuides.ts` | Instructional content (add `localImagePath` for your PNGs) |
| `public/guides/` | Drop teaching images here and reference them from `measurementGuides` |
| `types/models.ts` | Shared TypeScript models |

## Customization hooks (TODOs in code)

- **Breed- or weight-specific reference ranges:** extend `lib/interpretation.ts` and/or `lib/calculations.ts` (comments mark insertion points).
- **Teaching images:** add files under `public/guides/` and set `localImagePath` on entries in `data/measurementGuides.ts` (e.g. `/guides/ao-la.png`).

## GitHub

Upstream repository: [https://github.com/kutu95/echo](https://github.com/kutu95/echo.git)

After cloning, use the same `npm install` / `npm run dev` workflow. To publish updates from a local clone that already has `origin` set:

```bash
git push -u origin main
```

## Disclaimer

This application is for **educational and clinical support only**. It does not provide a medical diagnosis. Always correlate with full clinical context and specialist review where appropriate.
