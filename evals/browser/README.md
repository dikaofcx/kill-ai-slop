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

## Run against a project URL

Start your app yourself, then pass a local or staging URL you control. The URL may include a route; the runner uses it unless `--path` overrides it:

```sh
npm run test:browser:target -- https://staging.example.com/about
```

The target must be reachable from this machine and use HTTP or HTTPS. By default, the suite expects a menu button that starts collapsed, controls a hidden panel through `aria-controls`, changes `aria-expanded`, opens with Enter and pointer activation, and closes with Escape. Pass selectors for equivalent controls, or use visual-only mode when the target has no menu:

```sh
npm run test:browser:target -- --url http://127.0.0.1:3000 --path / --menu-toggle 'button[aria-controls="site-menu"]' --menu-panel '#site-menu'
npm run test:browser:target -- https://staging.example.com --visual-only
```

To pass additional Playwright options, put them after a second `--`, for example `npm run test:browser:target -- https://staging.example.com --visual-only -- --headed`. The runner also accepts `EVAL_BASE_URL`, `EVAL_PATH`, `EVAL_MENU_TOGGLE`, and `EVAL_MENU_PANEL` environment variables. The older `EVAL_BASE_URL=... EVAL_PATH=/ npm run test:browser` form remains supported.

The tests do not log in, submit forms, follow external links, or inspect other routes. Add only the routes and state transitions you intend to test. Review each viewport screenshot yourself; passing the overflow check does not establish that a layout is usable or visually successful. Add real project-specific tests and fixtures before treating this starter as a regression suite for your app.
