# Rollout Planner CRM (#21)

leadMarketing's phase/country fields turned into a city-by-city expansion planner next to the live
pipeline. Sixth and final Type-3 (Pure leadMarketing) build in this pass.

`Lead` + scoring ported verbatim from Worth-Contacting CRM (`#12`) — "next to the live pipeline" from
the pitch means this product's own lead list *is* a scored pipeline, not a separate unscored table.

`Lead.phase` reuse **reinterpreted, not literally ported**: leadMarketing's `phase` is a fixed
internal numeric enum (`1=Europe|2=Dubai|3=USA`) with no meaning for a standalone customer — dropped
for the same reason it was dropped from WhatsApp-Only CRM (`#13`) and Warmup-as-a-Service (`#14`).
Here `ExpansionPhase` is the real product concept instead: a customer-defined, ordered rollout bucket
("Phase 1: East Coast") that leads get assigned into.

`GET /leads/geography` is the "which city to prospect next" signal — unassigned leads grouped by
country, ranked by average score.

## Local dev

Backend: `:3323`. Frontend: `:5197`.

```
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

```
cd frontend
npm install
npm run dev
```
