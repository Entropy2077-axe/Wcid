# Wcid — Todo + Schedule App

Cross-platform PWA. React 18 + Vite 5 + Zustand. Targets Windows browsers and older Android (Chrome 80+).

## Commands
- `npm install` — install deps
- `npm run dev` — dev server (localhost:5173)
- `npm run build` — production build to dist/
- `npm run preview` — preview production build

## Architecture
- `src/store.js` — Zustand store, persisted to localStorage key `wcid-store`
- `src/tokens.css` — all CSS custom properties (design tokens)
- `src/global.css` — resets and base styles
- `src/App.jsx` — root component, tab routing, modal state
- `src/components/` — leaf components, one file per component

## Data model
Task: { id, type:'task', title, dueDate:ISO|null, priority:'low'|'medium'|'high', completed, createdAt }
Schedule: { id, type:'schedule', title, date:ISO, startTime:'HH:MM', endTime:'HH:MM', description:'', createdAt }

## Design rules
- All color/spacing through CSS custom properties from tokens.css — no hardcoded hex values in components
- No inline styles except where truly dynamic (e.g. computed positions)
- Touch targets ≥ 44px
- Dark mode via prefers-color-scheme media query on :root

## AI integration (planned, not yet implemented)
Planned: natural language input that calls Claude API to parse into Task or Schedule objects.
