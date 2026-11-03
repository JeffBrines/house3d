# House3D — make it your own

An editable house walkthrough and finish studio. Explore two floors, try paint,
flooring, cabinetry, tile and fixtures, or circle a surface and bring the request
to a coding assistant. The source is here so you can make your own version.

**[Source repository](https://github.com/JeffBrines/house3d)** ·
**[Download source](https://github.com/JeffBrines/house3d/archive/refs/heads/main.zip)**

## Run your copy

Download and unzip, open the folder in your coding assistant, and run:

```sh
npm start
```

Open **http://127.0.0.1:8080/**. Node.js 22+ is required; no `npm install` is
necessary. Alternatively, with Python 3:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Use HTTP rather than double-clicking index.html. The browser needs WebGL.
If the port is busy, use `PORT=8081 npm start` or change the Python port to 8081.
No API keys, account, paid services, database or ChatGPT runtime are required.
Libraries and textures are bundled locally.

## Start with your assistant

> Read README.md and AGENTS.md. Run this house app locally and explain the main
> source files. Help me customize my own copy. Keep layout export/import working,
> and do not deploy anything unless I ask.

`dist/` is the editable source. Change a file and refresh the browser.
Code edits in this folder cannot alter the original hosted site. A GitHub fork
is your own repository; changes reach the original only if its owner accepts them.

## Find your way around

- **Explore:** choose a floor, room or saved view.
- **Finishes:** open a material category to compare paint, wood, tile, cabinetry or fixtures.
- **Edit:** choose furniture, kitchen cabinetry, bathroom cabinetry or light fixtures.
- **Project:** export/import layouts, switch plan versions, and review drawings or studies.

The house toolbar contains **Circle an area**, **Measure**, **View** and **Map**.
View holds ceilings, cutaways, realistic lighting, quality and exposure.
On phones, the bottom dock opens the same studio sections; **Back to house**
closes the drawer.

## Bring the finishes you already tried

On the hosted site, click **Project → Export layout** (also available from **Get your own
copy → Save my current layout**). Import that JSON into your local app. It includes
all three designs, both floors, furniture, fixtures and finish choices.

Browser edits are saved in localStorage for that browser and origin. They are
not uploaded and are not included automatically in a source download. Export
before clearing storage or moving devices. The Circle & request tool also works
locally: attach the marked PNG or request ZIP to your assistant's conversation.

## Find the code

| Files in `dist/` | What they control |
| --- | --- |
| `app.js`, `index.html` | Scene, interface, layout import/export |
| `navigation-ui.js`, `navigation.css`, `mobile-ui.js` | Studio sections, finish categories, scene toolbar and phone drawer |
| `revision-*-model.json`, `revision-config.js` | Current main-floor/basement walls, rooms and fixtures |
| `model.json`, `basement-model.json`, `expanded-suite-model.json`, `suite-*.js` | Earlier designs and comparison |
| `house-layout.js`, `house-furniture.js`, `dining-furniture.js` | Furniture arrangement and geometry |
| `finish-config.js`, `finish-ui.js`, `surface-materials.js` | Finish controls and materials |
| `kitchen-*.js`, `bathroom-cabinets.js`, `fixture-geometry.js` | Cabinetry, countertops, sinks, faucets and hardware |
| `exterior-doors.js`, `discovery-stove.js` | Doors and wood stove |
| `photo-renderer.js`, `lighting-*.js`, `ceiling-finish.js` | Lighting, rendering and ceiling appearance |
| `stair-*.js`, `walk-navigation.js` | Stairs and navigation |
| `area-markup.js`, `area-targets.js`, `markup-export.js` | Circle selection and assistant requests |
| `remix-ui.js`, `distribution-config.js` | Source download and public/private asset settings |

World coordinates are feet. North is +X, east/front is +Z, west/back is -Z.
Many finish and cabinet controls use inches. Geometry follows revised plans,
but furniture, finishes and details remain illustrative studies. Confirm actual
dimensions and physical product samples before construction or ordering.

## Host your own version on Vercel

1. Fork this repository to your GitHub account.
2. In Vercel, import **your fork** as a new project.
3. The included `vercel.json` sets **Other**, build `npm run build`, output `dist`.
4. Deploy. No environment variables are required.

The build regenerates `dist/downloads/house3d-source.zip` from the current source,
so visitors can download the version they are viewing. In your fork, update
`distribution-config.js`'s repository URL and the README links to your repository.
You can also upload the contents of `dist/` to any static host after `npm run build`.

Only the Vercel project owner and authorized collaborators can publish changes
to that deployment. In-app edits stay on each visitor's device; there is no shared
write endpoint. Protect your own GitHub/Vercel accounts as usual.

## Checks

```sh
npm test
```

Additional geometry tests live in `tests/`; tests that import Three.js use
`node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/NAME.mjs`.

## What is included

The editable application, the schematic 3D model, bundled runtime libraries,
CC0 textures, tests and starter instructions. The original architectural drawing
PDFs/images and private manufacturer flooring swatch are omitted. The Saguaro
product remains a named reference, rendered using illustrative CC0 oak grain.
The download contains no account credentials, deployment identity, private notes
or anyone's browser-saved layouts.

Original application code is MIT licensed. See LICENSE and
THIRD-PARTY-NOTICES.md for the retained third-party licenses and texture credits.
