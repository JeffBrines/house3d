# Cold Springs — Pramer residence

An independent Three.js house walkthrough, based on the supplied architectural
Revision 1 of October 28, 2026. This project has separate geometry, settings,
furnishings, source package, and hosting identity from the Brines residence.

## Run and hand off

Run `npm start`, then open http://127.0.0.1:8080. Use `PORT=8081 npm start` when
that port is in use. No installation or build is required. Application modules
are authored directly in `dist/`. Three.js and OrbitControls are bundled locally
with their MIT license. No API keys, backend, or external network calls are needed.

Deploy only the contents of `dist/` to a static host after `npm run build`.
The Vercel project uses this repository with root directory
`houses/cold-springs`, framework Other, build `npm run build`, output `dist`,
and no dependency installation. The included `vercel.json` supplies the build
settings. Keep this as a separate Vercel project from the root House3D app.
Production deploys from `main` after the PR is merged; the first release can
also be deployed from the reviewed PR commit without merging it.

`npm run build` creates a model-derived SVG and an independent downloadable source
ZIP. Both use Node's standard library; Python is not required to build or host.
The deployed home page is intended to be accessible without ChatGPT or Vercel
sign-in. Sharing that link gives visitors access to the walkthrough; it does
not grant repository write or hosting administration rights.

To move material choices between browsers, use Project notes → Export choices,
then Import choices in the destination. Browser storage uses
`cold-springs-pramer-settings-v1`. The source ZIP does not include browser state.

## Plan basis and geometry

- Architectural PDF: `3 Cold Springs Rev1 10-28-26.pdf`, seven pages.
- A-1, page 3: wall footprints, room arrangement and opening tags, 1/4 inch =
  1 foot (18 PDF points per foot). The PDF page rotation is 270 degrees.
- A-1b, page 4: roof and ceiling slopes; standard plate 9 ft 1 1/8 inches.
- A-3/A-4, pages 5–6: elevation form, glazing, porch and garage levels.
- Structural PDF: `FINAL STRUCTURAL W CHIMNEY.pdf`, six sheets, dated
  October 12, 2026. S103 shows the chimney envelope as 4 × 8 ft; architectural
  A-1b calls it 3 × 6 ft. This discrepancy remains unresolved.
- Cover-sheet areas: living 2,819 sq ft; garage 971 sq ft. These are declared
  drawing areas, not a recalculation of the rendered mesh.

Coordinates use feet: X increases to the right of A-1; Z increases down A-1;
Y is height. Do not substitute compass directions: the north arrow is angled.
The PDF drawing origin is (499.32, 232.56) in displayed page points.

`scripts/build-model.py` extracts closed wall outlines from CAD line weights,
classifies non-wall symbols, supplements interrupted wall traces, and cuts
explicit openings. It writes `dist/model.json`, a local-only drawing crop,
and a local verification overlay. Requires PyMuPDF and Shapely. Place the original
architectural PDF under `source-plans/` before regeneration. The original PDFs and raster drawing crops
stay local and are excluded from Git, hosting assets, and source downloads.
The public model-plan SVG is generated independently from `model.json`.

## Scope and assumptions

The model includes the single living level, garage transition, porch and rear
patio. The crawlspace and attic are not modeled as occupiable floors. Interior
openings are shown open to support walking. The front entry leaves and central
patio leaves are open; garage doors remain closed.

The supplied architectural PDF does not include referenced A-2 window/door
schedules or ceiling section 2/A-2. Tags and elevations supply approximate
opening sizes and heights; detailed heads, joinery, vaulted ceiling transitions,
roof intersections, garage slab slope, and dormer framing remain provisional.
The main ceiling rises toward the A-1b ridge, using the noted 2.5:12 kitchen-side
and 5:12 great-room-side slopes. Review against the missing section before
treating that profile as approved. The garage is simplified to a floor 18 inches
below the house, with three 6-inch steps matching the plan's schematic notation.

All floor, paint, cabinetry, furniture, decorative materials, and lighting
are provisional spatial references. They are not client selections and inherit
no Brines residence selections. Furniture can be hidden. Exterior roof masses
are simplified intersecting gables. Rear patio extension dimensions were marked
N.T.S.; that extension is schematic. No model output certifies construction.

## Source map

- `dist/model.json`: traced wall footprints, openings, hull, provenance and assumptions.
- `dist/project.js`: project identity, room destinations, provisional furniture and defaults.
- `dist/geometry.js`: 3D wall, opening, ceiling, roof, furnishing and finish construction.
- `dist/spatial.js`: collision, floor levels and ceiling heights.
- `dist/walk-navigation.js`: swept movement and wheel input, reused from House3D.
- `dist/app.js`: rendering, desktop/touch navigation, map, persistence and exports.
- `dist/index.html`, `style.css`: responsive interface, drawing viewer, handoff controls.
- `tests/model.mjs`: dimensions against A-1, connectivity to room anchors, movement and state isolation.
- `tests/distribution.mjs`: public-package exclusions, assets, and standalone handoff checks.

Run `npm test` after geometry or navigation changes. Browser review must also
check rendered plan fidelity, interior views, mobile controls, roof visibility,
material editing, reference drawing, and export/import. Numerical tests alone
cannot establish visual fidelity.
