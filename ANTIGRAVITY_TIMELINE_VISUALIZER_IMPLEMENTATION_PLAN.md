# Antigravity Implementation Plan — Google Maps Timeline Visualizer

## 0. Project Goal

Build a browser-based **Google Maps Timeline / GPS Journey Visualizer** inspired by the reference project:

- Reference: https://arrafi-byte.github.io/Maps-Timeline-Visualizer/
- Reference title: **Maps Timeline — GPS Journey Visualizer**

The application should turn a user's Google Maps Timeline/location-history JSON into an interactive animated journey on a map.

The implementation must prioritize:

1. Local-first processing.
2. Correct parsing of Timeline JSON.
3. Smooth route visualization.
4. Deterministic playback.
5. Clear UI feedback.
6. Privacy: location data should remain in the browser unless the user explicitly adds a future server feature.
7. Maintainable architecture over shortcuts.

The reference currently exposes the following core interaction pattern: upload a file or use sample data, show status, GPS point count, travelled distance, progress, playback speed controls, base zoom controls, and JSON/sample-data inputs. citeturn238083view0

Current Timeline exports can exist in more than one structure, including `Records.json`, `timelineObjects`, `semanticSegments`, and generic coordinate arrays. A robust implementation should therefore isolate parsing from rendering and normalize all supported inputs into one internal route format. citeturn238083search5

---

# 1. Non-Negotiable Development Philosophy

Antigravity must build the project **incrementally**.

Never generate the entire application in one giant step.

Every phase must end with:

- code that runs,
- a verification step,
- a clear explanation of what was implemented,
- known limitations,
- and the next smallest logical step.

Do not proceed to the next phase if the current phase has unresolved build/runtime errors.

The correct order is:

**Understand → Plan → Implement small unit → Run → Test → Inspect → Fix → Verify → Continue**

---

# 2. Phase 0 — Inspect the Existing Project

Before modifying anything:

1. Inspect the repository structure.
2. Identify the framework and build tool.
3. Read `package.json`.
4. Identify the entry points.
5. Identify the current styling system.
6. Identify existing map libraries.
7. Identify existing utility/helper folders.
8. Identify environment variables.
9. Identify testing/linting configuration.
10. Run the existing project before changing code.

### Required output from Antigravity

Create a short repository report:

```text
Framework:
Build tool:
Package manager:
Entry point:
Main app component:
Styling system:
Map library:
Testing:
Linting:
Existing relevant components:
Existing relevant utilities:
Environment variables:
Current run status:
```

Do not start implementation until this report is complete.

---

# 3. Phase 1 — Define the Architecture

Use a modular architecture similar to:

```text
src/
├─ app/
├─ components/
│  ├─ map/
│  ├─ controls/
│  ├─ upload/
│  ├─ stats/
│  └─ layout/
├─ features/
│  └─ timeline/
│     ├─ parser/
│     ├─ normalizer/
│     ├─ animator/
│     ├─ distance/
│     └─ validation/
├─ hooks/
├─ lib/
├─ types/
└─ data/
   └─ sample/
```

Do not copy this structure blindly.

First inspect the existing project and adapt the structure to it.

### Core separation

The following concerns must remain separate:

```text
File input
    ↓
JSON validation
    ↓
Timeline parser
    ↓
Normalized route data
    ↓
Route statistics
    ↓
Animation state
    ↓
Map renderer
    ↓
UI controls
```

The map UI must never directly parse raw Google Timeline JSON.

---

# 4. Phase 2 — Define the Internal Data Model

Before implementing the parser, define one internal format.

Example:

```ts
type GPSPoint = {
  lat: number
  lng: number
  timestamp?: string
  accuracy?: number
}

type Journey = {
  points: GPSPoint[]
  totalDistanceMeters: number
  startTime?: string
  endTime?: string
  durationMs?: number
}
```

The exact type names may change according to the existing codebase.

The important rule is:

> Rendering code receives normalized data, never raw provider-specific JSON.

---

# 5. Phase 3 — Implement File Loading

Implement file selection/drop-zone behavior.

Required behaviors:

### Valid input

- `.json`
- Timeline JSON
- Records JSON
- supported location-history JSON

### Invalid input

Show a human-readable error instead of crashing.

Example:

```text
Unable to read this file.

The selected JSON does not contain a supported Timeline/location-history structure.
```

### Security/privacy

Process the file in the browser.

Do not upload it to a backend.

Do not log the entire location-history object to the console.

Do not persist raw location history in localStorage by default.

---

# 6. Phase 4 — Build the Timeline Parser

Implement the parser as an isolated module.

The parser should attempt formats in a deterministic order.

Potential supported structures include:

1. Google Timeline `Records.json`.
2. Google Timeline `timelineObjects`.
3. Google Timeline `semanticSegments`.
4. Generic arrays containing latitude/longitude coordinates.

Timeline Visualizer projects in the current ecosystem explicitly account for multiple Timeline export formats, so parser flexibility is a required architectural consideration rather than an optional enhancement. citeturn238083search5turn238083search3

### Parser rules

- Validate before transforming.
- Ignore malformed points instead of crashing the application.
- Preserve timestamps where available.
- Normalize latitude/longitude into consistent numeric values.
- Remove obviously invalid coordinates.
- Sort points chronologically when timestamps are available.
- Avoid inventing missing timestamps.
- Return structured parser errors.

Example result:

```ts
{
  success: true,
  journey: {
    points: [...]
  },
  sourceFormat: "semanticSegments"
}
```

or:

```ts
{
  success: false,
  error: {
    code: "UNSUPPORTED_FORMAT",
    message: "No supported Timeline structure was detected."
  }
}
```

---

# 7. Phase 5 — Calculate Journey Statistics

Implement deterministic calculations.

Required values:

- GPS point count.
- Total travelled distance.
- Start timestamp.
- End timestamp.
- Journey duration when timestamps exist.

Use a proper geographic distance calculation such as the Haversine formula.

Do not estimate distance from screen pixels.

Example:

```text
GPS Points
12,842

Distance
1,284.6 km

Duration
2d 08h
```

The values shown in the UI must be derived from the normalized route data.

---

# 8. Phase 6 — Implement the Map

Select the map library only after inspecting the existing project.

The map layer must support:

- route/polyline,
- current animated position,
- camera movement,
- zoom level,
- route fitting,
- optional map controls,
- responsive dimensions.

Keep map-specific code isolated.

Recommended conceptual interface:

```ts
<MapView
  route={journey.points}
  progress={progress}
  zoom={zoom}
  followMarker={followMarker}
/>
```

Do not allow map-library-specific objects to spread through the entire application.

---

# 9. Phase 7 — Implement Animation Engine

Create an independent animation controller.

Required state:

```text
idle
loading
ready
playing
paused
completed
error
```

Required controls:

- Play.
- Pause.
- Restart.
- Seek.
- Playback speed.
- Progress indicator.

Reference-style speed controls can include:

```text
1×
2×
5×
10×
```

The animation should be deterministic.

Given the same input route, duration, speed, and settings, playback should follow the same path.

Do not make animation depend directly on React render frequency.

Use a controlled timing mechanism such as `requestAnimationFrame`.

---

# 10. Phase 8 — Route Interpolation

Do not jump directly from one GPS point to another.

Interpolate the marker between points.

Conceptually:

```text
GPS point A ─────────── GPS point B
             ↑
        animated marker
```

At every animation frame:

1. Determine current timeline position.
2. Find the surrounding route points.
3. Interpolate latitude.
4. Interpolate longitude.
5. Update marker.
6. Update displayed progress.
7. Update travelled-distance display if the UI calls for live progress.

---

# 11. Phase 9 — Camera Movement

Implement camera behavior separately from route animation.

Possible modes:

### Follow mode

Camera follows the animated marker.

### Overview mode

Camera remains fitted to the entire journey.

### Manual mode

User controls map position/zoom without automatic camera movement.

Do not couple camera state and marker state more tightly than necessary.

---

# 12. Phase 10 — Reference-Style UI

Recreate the **interaction model**, not source code.

Reference-oriented UI elements:

```text
┌──────────────────────────────────────┐
│ My Journey                           │
│                                      │
│ Upload file / Sample Data            │
│                                      │
│ READY                                │
│                                      │
│ GPS Points        Distance           │
│ 12,842            1,284 km           │
│                                      │
│ Progress                             │
│ ──────────────────────────── 64%     │
│                                      │
│ ▶ Play   1×   2×   5×   10×          │
│                                      │
│ Base Zoom                            │
│ [ 9 ] [ 11 ] [ 13 ]                  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │             MAP                  │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Use the reference as a UX target, but do not copy its source code or assets.

The visual design may be improved, but the core workflow must remain simple:

**Load → Inspect → Play → Control → Explore**

---

# 13. Phase 11 — Sample Data

Create a small synthetic sample dataset.

The sample must:

- contain multiple points,
- span enough distance to visibly demonstrate movement,
- include timestamps,
- be deterministic,
- contain no real person's private location data.

The "Sample Data" button must work even when the user has not uploaded anything.

This is essential for development and demo/testing.

---

# 14. Phase 12 — Progress System

Implement progress as a normalized number:

```text
0 → 1
```

Display it as:

```text
0%
25%
50%
75%
100%
```

The progress bar must be driven by actual animation state.

At `100%`:

- marker reaches the final coordinate,
- playback stops,
- state becomes `completed`.

Restarting should return progress to `0`.

---

# 15. Phase 13 — Error Handling

Every external/user-controlled input must have an explicit failure path.

Handle:

- invalid JSON,
- empty JSON,
- unsupported schema,
- invalid coordinate,
- extremely large file,
- no usable points,
- malformed timestamps,
- map initialization failure,
- animation failure.

Error messages should describe:

1. What failed.
2. Why it probably failed.
3. What the user can do next.

Do not expose raw stack traces in the normal UI.

---

# 16. Phase 14 — Performance

Timeline files may be large.

Do not assume a small dataset.

Measure and optimize only after identifying the actual bottleneck.

Potential optimizations:

- avoid unnecessary React state updates on every frame,
- keep animation state outside normal render cycles where appropriate,
- memoize expensive calculations,
- preprocess route data,
- optionally simplify extremely dense routes,
- use Web Workers only when evidence shows the main thread is blocked.

Never add a complex optimization just because it sounds faster.

---

# 17. Phase 15 — Privacy

This application handles sensitive location information.

Required behavior:

- local file processing,
- no analytics containing raw coordinates,
- no network upload of Timeline JSON,
- no debug logging of raw location data,
- clear privacy statement in the UI,
- sample data must be synthetic.

Current Timeline Visualizer implementations emphasize local/browser processing and explicitly state that Timeline data does not need to leave the device. citeturn238083search5turn238083search4

---

# 18. Phase 16 — Testing Strategy

Test each layer separately.

### Parser tests

Test:

- valid Records format,
- valid timelineObjects format,
- valid semanticSegments format,
- generic coordinate format,
- invalid JSON,
- missing coordinates,
- invalid coordinates,
- missing timestamps.

### Calculation tests

Test:

- zero points,
- one point,
- two points,
- multiple points,
- known-distance route.

### Animation tests

Test:

- play,
- pause,
- restart,
- completion,
- speed change,
- seek.

### UI tests

Test:

- upload,
- sample data,
- error messages,
- statistics,
- playback controls,
- responsive layout.

---

# 19. Phase 17 — Build Verification

After every significant feature:

```bash
npm run lint
npm run test
npm run build
```

Use the project's actual scripts when they differ.

Also perform a browser smoke test:

1. Start development server.
2. Load application.
3. Load sample data.
4. Verify map.
5. Verify statistics.
6. Start playback.
7. Change speed.
8. Pause.
9. Restart.
10. Load a real test JSON.
11. Trigger invalid input.
12. Verify error handling.

---

# 20. Phase 18 — Deployment

Only after local verification passes.

Deployment target can be chosen based on the existing repository:

- GitHub Pages,
- Vercel,
- Netlify,
- another static hosting service.

For a fully client-side implementation, static hosting is preferred.

Before deployment verify:

- production build succeeds,
- asset paths work,
- map configuration works,
- browser APIs used by the app are supported,
- no private Timeline data is committed to Git.

---

# 21. Development Order

Antigravity MUST follow this order unless a technical dependency requires a documented change:

```text
1. Inspect repository
2. Run existing project
3. Architecture
4. Types/data model
5. File loader
6. JSON validation
7. Parser
8. Normalized journey model
9. Distance/statistics
10. Map
11. Animation engine
12. Route interpolation
13. Progress
14. Playback controls
15. Camera
16. Reference-style UI
17. Sample data
18. Error handling
19. Performance review
20. Tests
21. Production build
22. Deployment
```

---

# 22. Definition of Done

The project is considered complete only when:

- users can load supported Timeline JSON,
- the parser produces normalized route data,
- the map shows the route,
- the marker animates along the route,
- progress is accurate,
- playback controls work,
- zoom controls work,
- statistics are correct,
- sample data works,
- invalid files produce useful errors,
- location data stays local,
- tests pass,
- lint/build pass,
- production deployment works.

Do not declare the project finished merely because the UI looks correct.

Functional correctness comes first.
