# Browser-based visual and interaction checks

This Playwright starter captures screenshots at 360, 768, and 1440 CSS pixels, checks for horizontal page overflow, and exercises one accessible menu interaction (keyboard activation, Escape, and pointer). Screenshots are evidence for human review—not visual-regression comparisons, accessibility certification, or a quality score. The local fixture only proves the harness runs; it does not evaluate this repository's product design.

## Run the included fixture

From the repository root:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

The screenshots, traces, and other test output are written under `test-results/browser/`.

## Point it at your own page

Start your app yourself, then run the suite against a local or staging URL you control:

```sh
EVAL_BASE_URL=http://127.0.0.1:3000 EVAL_PATH=/ npm run test:browser
```

On PowerShell, set the environment variables with `$env:EVAL_BASE_URL` and `$env:EVAL_PATH` before running the command. The suite expects a menu button that starts collapsed, controls a hidden panel through `aria-controls`, changes `aria-expanded`, opens with Enter and pointer activation, and closes with Escape. Set selectors for your equivalent controls, or edit `interactions.spec.mjs` when the product uses a different interaction:

```sh
EVAL_MENU_TOGGLE='button[aria-controls="site-menu"]' EVAL_MENU_PANEL='#site-menu' npm run test:browser
```

`EVAL_PATH` defaults to `/`. The test does not log in, submit forms, follow external links, or inspect other routes. Add only the routes and state transitions you intend to test. Review each viewport screenshot yourself; passing the overflow check does not establish that a layout is usable or visually successful. Add real project-specific tests and fixtures before treating this starter as a regression suite for your app.
