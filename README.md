# `goon.vc`
Public GOON SQUAD website. This process serves HTML and reverse-proxies the
Hub API paths used for Fabric site login (Passport / GoonCitizen desktop).

| Host | Role |
|------|------|
| **goon.vc** | This repo — GoonSPA + Hub API zipper |
| **relay.goon.vc** | GoonCitizen LiveRelay |
| **hub.fabric.pub** | Fabric Hub |

Favicon is the Fabric lettermark (serif **f**, white on royal purple `#4C1D95`).
Regenerate with `@fabric/http` `npm run make:icons`.

## Quick Start
```bash
npm i --allow-git=all
npm run build    # write assets/index.html from types/GoonSPA.js
npm start        # HTTP on 127.0.0.1:8080
```

Site copy (title, Discord widget, Bitcoin, footer) is `settings/local.js` → `site.*`.
Hub upstream is `FABRIC_HUB_ORIGIN` (must be allowlisted). See `DEPLOY.md`.
This tree’s contributor notes: [`DEVELOPERS.md`](DEVELOPERS.md). GoonCitizen
(LiveRelay, call for G00N / PERMAFLEET / other orgs):
[star-citizen-live `DEVELOPERS.md`](https://github.com/GoonCitizen/star-citizen-live/blob/feature/rsi/DEVELOPERS.md).
