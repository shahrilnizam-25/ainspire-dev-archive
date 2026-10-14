# AiNspire Motion Display

Editable 1080 × 1920 motion infographic. Page 1 is *Future enhancements*; page 2 is split into
two chapters, *Front end* and *Back end*, so the text stays legible on a portrait display.
The loop runs about 62 seconds (24s, 19s and 19s).

## Run locally

From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. Everything, including the font, is bundled locally.

## Controls

- `Space`: pause or resume (resumes from the same point)
- `Left Arrow` / `Right Arrow`: previous or next chapter
- `F`: toggle fullscreen
- The control bar auto-hides after a few seconds and returns on any key press or mouse move

Scene length and the delay before the spotlight starts are set per scene with `data-duration` and
`data-reveal` (milliseconds) in `index.html`.

## v2 source alignment

The display packages local copies of the approved materials from
`ainspire-v2-publish/v2/public`:

- `ainspire-logo-transparent.png`
- `tm-logo-official.png`
- `hero-3d-v6.webp`
- `hero-cinematic.jpg`

The role and journey flow on slide 2 was checked against the current v2
implementation:

- `src/components/ViewNavigation.tsx`: Staff ID role-gated Employee,
  Supervisor, and HR views
- `src/App.tsx`: employee identity, six assessment questions, optional
  adaptive reflection, pledge, AI analysis, and results
- `src/components/POCJourney.tsx`: Understand, Develop, Deploy, and Measure
- `src/components/SupervisorDashboard.tsx`: Review Request, Confirm Capacity,
  and Record Decision
- `src/components/HRWorkforceDashboard.tsx`: Understand Workforce, Develop
  Capabilities, Develop Talents, and Review Outcome
- `server/classify.ts`, `server/mcpLearning.ts`, and `server/notifications.ts`:
  classification, learning search, and notification services shown in the
  architecture

The display does not import files from v2 at runtime, so it remains portable
and can be served independently from this folder.
