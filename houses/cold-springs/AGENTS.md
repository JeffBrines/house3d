# Cold Springs

This folder is a standalone house, deployed independently from the root app.
Read README.md. `dist/` is authored source. Use `npm start`, `npm test`, and
`npm run build` from this directory. Node 22+ is sufficient; no install is needed.

- Coordinates are feet: +X is right on sheet A-1, +Z is down, +Y is up.
  Do not reuse the root house's compass orientation or geometry.
- Preserve the `cold-springs-pramer` project identity and isolated storage key.
- The Vercel root directory is `houses/cold-springs`, output `dist`.
- Original architectural PDFs and raster drawing crops are private. They do not
  belong in Git, deployments or downloads. The model-derived SVG is public.
- Keep `source-plans/`, `tmp/`, `.openai/`, `.vercel/` and credentials excluded.
- Update the model's assumptions when changing provisional dimensions.
- The source ZIP is generated with Node at build time. It must run independently
  after extraction and contain no private assets or hosting identity.
- Run the circulation and distribution checks after relevant changes. Inspect
  rendering and navigation in a browser for visual or interaction changes.
