Original prompt: cavbot-arcade folder in GitHub/cavbot/cavbot-arcade exposes the 404 game; make the 404 game load via the CDN exactly like customer installs, verify gameplay/rendering/assets, then delete the exposed cavbot-arcade folder.

Progress:
- Identified local exposure path: `404.html` iframes `/cavbot-arcade/404/cavbot-imposter/v1/index.html`.
- Verified customer arcade install model from `cavbot-app`: `https://cdn.cavbot.io/sdk/arcade/v1/loader.min.js` with `data-project-key`, `data-site-id`, `data-site`, `data-config-origin`, and `data-env`.
- CDN loader URL returns HTTP 200. App config endpoint requires project key as expected.
- Replaced `404.html` local iframe with explicit CDN loader install markup.
- Browser verification from `127.0.0.1` and production-origin simulation confirmed the page no longer requests `/cavbot-arcade/404/...`, but the live app blocks the official CDN loader preflight because `x-cavbot-env` is missing from the arcade config CORS allow headers.
- Patched `cavbot-app/app/api/embed/arcade/config/route.ts` to allow `x-cavbot-env`, matching the live CDN loader request headers.
- Production database access currently returns `unpaidPlanInvoice`, causing the live arcade config route to fail before it can mint signed CDN URLs.
- Added a tightly scoped first-party `cavbot.io` 404 arcade config fallback in `cavbot-app` that still uses the official CDN loader contract and signed `/api/embed/arcade/signed/...` delivery, without exposing `/cavbot-arcade`.

Completed:
- Deployed the protected arcade asset package to the CavBot client Pages project behind a token-validating `/arcade/*` function.
- Deployed `cavbot-app` config and signed proxy updates so the official CDN loader can mint signed 404 arcade iframe URLs for the first-party `cavbot.io` 404 page.
- Deployed `cavbot` 404 page using the public install contract:
  `https://cdn.cavbot.io/sdk/arcade/v1/loader.min.js`,
  `data-config-origin="https://app.cavbot.io"`,
  `data-project-key="cavbot_pk_gHn737DTf4afJ2xGpBFzZQ"`,
  `data-site-id="cavbot.io"`,
  `data-site="cavbot.io"`,
  `data-env="404"`.
- Live Playwright verification passed against `https://www.cavbot.io/404?verify=1781283800`:
  one `CavBot Arcade` iframe rendered at 1440x960, CDN loader and config calls were present, signed arcade asset requests loaded, no local `/cavbot-arcade/404/...` requests occurred, and there were no request failures or page errors.
- Visual screenshot check confirmed the game UI, CavBot heads, activity panels, and powered badge render from the embedded frame.
- Confirmed old exposed production path `https://www.cavbot.io/cavbot-arcade/404/cavbot-imposter/v1/index.html` returns 404.
- Deleted the exposed local `cavbot/cavbot-arcade` folder from the main checkout after live CDN verification succeeded.

Follow-up redirect fix:
- Removed the extra branded 404 loading/exit overlay from `cavbot/404.html`.
- Changed `cavbot-client/sdk/arcade/v1/loader.min.js` to create the arcade iframe with `loading="eager"`.
- Fixed the brief Chrome `app.cavbot.io refused to connect` screen after game completion by removing embedded `window.top.location.assign(...)` fallback navigation from all six 404 game scripts. Embedded games now post `cavbot:arcade:navigate` to the host and return immediately; standalone game pages still navigate themselves with `window.location`.
- Updated the CDN loader host-page message listener to guard duplicate completion messages and use `window.location.replace(...)`.
- Verification: `node --check` passed for all six edited 404 game scripts and `sdk/arcade/v1/loader.min.js`; static redirect regression check confirmed no `window.top.location` fallback remains and every embedded postMessage branch returns. Playwright smoke could not run because the `playwright` package is not installed and `npx -p playwright` did not expose the ESM import in this environment.
- Hardening after live white-frame report: changed every 404 game redirect helper so embedded mode returns even if `postMessage` throws; changed the live 404 host and CDN loader to remove `#cavbot-arcade-root` before calling `location.replace(...)`.
- Deployed `cavbot-client` Pages project for `cdn.cavbot.io`: `https://58a1dff3.cavbot-client.pages.dev`.
- Deployed `cavbot` Pages project for `www.cavbot.io`: `https://8f5fc1b7.cavbot.pages.dev`.
- Live verification: `https://cdn.cavbot.io/sdk/arcade/v1/loader.min.js` contains `n.loading="eager"`, `__cavbotArcadeRedirecting`, iframe removal, and `window.location.replace`; `https://www.cavbot.io/404` contains iframe removal before redirect. Signed live `cavbot-imposter.js` from `app.cavbot.io/api/embed/arcade/signed/...` has `hasTopLocation=false` and `embeddedReturn=true`.
