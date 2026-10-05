# Security Policy

## Reporting a vulnerability

Please report security issues privately rather than opening a public issue.

- Use GitHub's [private vulnerability reporting](https://github.com/Kesowa/Aru-Client/security/advisories/new)
  on this repository, or
- email **security@kesowa.com** with the details.

Include what you did, what happened, and what you expected, with enough detail
to reproduce. We will acknowledge your report and tell you whether we intend to
fix it, and when.

Please test only against your own deployment, never against a Kesowa or customer
instance.

## Known issue: API keys in this repository

**We already know that `.env.development` is committed and contains real API
keys, and that some keys are hardcoded in `.tsx` components.** You do not need
to report these; they are being rotated and moved out of source.

Specifically known: a Google Maps key, two OpenWeather keys and a Mapbox public
token. The `VITE_SITE_KEY` / `VITE_SECRET_KEY` pair holds Google's published
reCAPTCHA *test* keys, not real ones.

What **is** worth reporting:

- **A key we have missed**, anywhere in the repository or its history.
- **A key that turns out to be unrestricted** — if you can show a committed key
  still works from an origin that is not ours, that is a real and useful
  finding, because restriction is the actual control here.
- **A genuinely server-side secret** committed to this repository. A database
  credential, a private key or a service-account JSON would be a serious
  finding, unlike a map token.

## What this application is

A browser single-page application. It holds no data of its own and enforces no
authorization — it renders what [Aru-Server](https://github.com/Kesowa/Aru-Server)
returns and sends what the operator does back to the server. Access control is
the server's responsibility.

This matters for triage: "the client lets me click a button I should not be
able to" is only a vulnerability if the **server** honours the resulting
request. Please check that before reporting, and report server-side findings
against Aru-Server.

Note also that **every `VITE_*` variable is compiled into the shipped
JavaScript**. That is inherent to a browser map client, not a bug. "I extracted
a `VITE_` value from your bundle" is expected; "that extracted value works from
anywhere" is the finding.

## In scope

- **Cross-site scripting**, especially anywhere user-supplied text, file names
  or GeoJSON properties reach the DOM.
- **Authentication and session handling** in the client: token storage,
  what survives logout, what leaks into URLs or logs.
- **Multi-tenant leakage** — any way a build for one `VITE_INSTANCE` reveals or
  reaches another tenant's data.
- **Unrestricted or over-scoped API keys**, as above.
- **Vulnerable dependencies.** `axios` is pinned at `^0.21.2` and is known to be
  behind; a demonstrated exploit path through it is in scope.
- **Content injection through uploaded media** — EXIF, GeoTIFF metadata or
  video containers reaching the UI unsanitised.
- **Clickjacking or framing** issues in the nginx configuration.

## Out of scope

- The committed API keys listed above, and the presence of `VITE_*` values in
  the built bundle.
- Google's reCAPTCHA test keys in `.env.development`.
- Missing authorization in the client, where the server enforces it. Report
  those against Aru-Server.
- Internal hostnames and `localhost` URLs in `.env.development`. These are
  development defaults, not reachable infrastructure.
- Findings in React, Vite, antd, deck.gl or other upstream dependencies, unless
  you can show an exploit path through this application. Report those upstream.
