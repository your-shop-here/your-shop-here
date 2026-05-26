# Your Shop Here — Claude Code Rules

## Platform

This project runs on **Salesforce B2C Commerce Cloud**. All server-side JavaScript (anything outside `/static` or `<script>` tags) must be compatible with **Mozilla Rhino 1.7.14**. That means:
- No ES6+ syntax server-side: no arrow functions, no template literals, no destructuring, no `const`/`let` (use `var`), no `class` syntax, no `Promise`, no `async/await`.
- Use the B2C Script API: https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html
- Do **not** use SFRA modules that do not exist in the workspace.

Client-side JavaScript in `/static` or `<script>` tags may use modern JS freely.

## Architecture

### Controllers (`cartridge/controllers/*.js`)
- Controllers render a **Page Designer page** and pass relevant parameters to it.
- The page creates components. Do **not** use ISML directly in controllers.

### Page Designer Components (`cartridge/experience/components/**`)
- A component = a **JSON definition** + a **JS file** in `experience/components/`.
- The component JS passes configuration to a **partial** and delegates all logic to it.
- No business logic in the component JS itself.

### Partials (`cartridge/partials/**`)
- A partial is a JS file with exactly two exports: `createModel(params)` and `template(model)`.
- The `template` method receives `model` automatically — do not instantiate the model inside it.
- Use **modern JS** (arrow functions, template literals, destructuring) in partials — they run in a Node.js build context, not Rhino.
- Do not use SFRA modules that are not present in the workspace.

### Static Assets (`cartridge/static/default/`)
- CSS lives in `cartridge/static/default/*.css` (e.g. `header.css`).
- Client-side JS lives in `cartridge/static/default/js/`.
- Assets are registered via `assets.addCss()` / `assets.addJs()` in ISML templates.

## Tooling

### B2C CLI Plugin
Use the `b2c` plugin (available via Claude Code skills) to interact with the live B2C instance — deploying code, running jobs, uploading/downloading files via WebDAV, checking logs, managing sites, etc. Prefer it over manual steps whenever interacting with the instance.

Skills available: `b2c-code`, `b2c-job`, `b2c-webdav`, `b2c-logs`, `b2c-sites`, `b2c-config`, `b2c-ods`, `b2c-slas`, `b2c-scapi-custom`, `b2c-mrt`, `b2c-ecdn`.

### Data Repository (`commerce-cloud-data/`)
`commerce-cloud-data/your-shop-here-data/` contains the site data that gets imported into the instance:
- `sites/YourShopHere/library/` — Page Designer library content (pages, components, slots)
- `sites/YourShopHere/preferences.xml` — site preferences
- `catalogs/` — product catalogs including navigation catalog
- `meta/` — system object / custom attribute metadata
- `pricebooks/` — pricebook definitions

When adding new Page Designer content or metadata, update the relevant XML here and re-import via the b2c plugin.

## Key Files

- `cartridge/static/default/header.css` — all header styles, including skin variable usage
- `cartridge/partials/header/yshHeader.js` — main header partial (regions: announcement, left, branding, right, menu)
- `cartridge/templates/default/experience/components/decorator/singleLineHeader.isml` — header ISML, loads `singleLineHeader.css` and `singleLineHeader.js`
- `cartridge/partials/header/skin.js` — CSS custom property definitions (`--skin-*` variables)
