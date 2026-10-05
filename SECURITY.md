# Security (goon.vc)

Public **HTML zipper** for the Fabric suite. Not a Hub and not a GoonCitizen relay.

**Topology:** [PLAN.md](PLAN.md). Agent hints: [AGENTS.md](AGENTS.md).

## What this process is
`@fabric/http` `HTTPServer` serving `assets/` and reverse-proxying `/sessions`,
`/device-links`, `/services/rpc`, and `/identity/cluster` + `/identity/cross-sign`
to `FABRIC_HUB_ORIGIN` (default `https://hub.fabric.pub`). No Fabric Peer listen,
no Bitcoin, no Discord bot, no `/services/star-citizen`.

## Learnings (2026-08-14)
- Hosted GoonCitizen privacy gates live in **`star-citizen-live`**, not here.
- Site-login redeem uses `@fabric/http` `pollSecret` (`X-Fabric-Poll-Secret` from
  `POST /sessions`). This zipper must not put that secret on `fabric://` / QR
  and must not add a second redeem path.
- Sidechain path policy in `@fabric/core`: allow-prefix `'/'` matches every
  JSON Pointer. GoonCitizen aggregate patches currently target `/services/rsi`
  on Hub — keep that policy on Hub / LiveRelay, not this tree.

## Process
1. Do not grow this tree back into a Hub or LiveRelay.
2. Never commit Hub admin tokens or `settings/local.js` secrets.
3. Prefer loopback HTTP behind Caddy (`DEPLOY.md`).
