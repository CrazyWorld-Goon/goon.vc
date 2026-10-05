# goon.vc Agent Hints (AI)

Public **HTML zipper** for the Fabric suite. Do not grow this tree back into a Hub
or a GoonCitizen relay.

**Topology (PLAN.md):**
1. `goon.vc` — this repo: GoonSPA HTML + same-origin Hub API proxy
2. `relay.goon.vc` — GoonCitizen LiveRelay (`star-citizen-live`)
3. `hub.fabric.pub` — generic Fabric Hub (contract registry, Beacon, `/sessions` owner)

**What this process is:** `@fabric/http` `HTTPServer` serving `assets/` and
reverse-proxying `/sessions`, `/device-links`, `/services/rpc`, and
`/identity/cluster` + `/identity/cross-sign` to `FABRIC_HUB_ORIGIN`
(default `https://hub.fabric.pub`). No Fabric Peer listen, no Bitcoin, no
Discord bot, no `/services/star-citizen`. Favicons are the suite lettermark
(serif **f** on royal purple `#4C1D95`) from `@fabric/http` `npm run make:icons`.
The HTML client probes `OPTIONS /services/rpc` on load; when the Hub proxy is
unreachable (502/504 / hub-unreachable), Login CTAs are hidden.

GoonCitizen release docs: `star-citizen-live/AGENTS.md`. Hub/core:
`docs/PRODUCTION*.md`. Human call for GoonCitizen contributors (not this zipper):
`star-citizen-live/DEVELOPERS.md`. This tree: [`DEVELOPERS.md`](DEVELOPERS.md),
[`SECURITY.md`](SECURITY.md).
