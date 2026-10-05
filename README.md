# ARU Client

The web front end for **ARU**, Kesowa's drone data management platform. It is
the operator's surface for the whole lifecycle of a drone mission: planning it,
watching the live video and telemetry come in, then viewing, annotating and
digitising the imagery and maps that come out.

Built with React, TypeScript and Vite. Mapping is deck.gl and Mapbox GL over
Cloud-Optimised GeoTIFFs served by TiTiler; live video arrives over RTMP/HLS.

> ARU was formerly called **Arya**, so you will still find that name in older
> code and commits.

## What it does

| Area | Purpose |
| --- | --- |
| `components/Missions/` | mission planning, live monitoring, and post-flight review |
| `components/Map/` | the main map surface — deck.gl layers over COG rasters, drawing and measurement tools |
| `components/Digitizer/` | tracing features from imagery into vector geometry |
| `components/Data/` | uploaded assets, locations and extracted outcomes |
| `components/Assets/` | file management for raw and processed deliverables |
| `components/ControlCenter/` | live operations view |
| `components/Dashboard/` | summary charts and activity |
| `components/SuperAdminPages/`, `TenantRootPages/` | multi-tenant administration |
| `components/Login/`, `SignUp/`, `MyAccount/` | authentication and profile |
| `components/shared/` | shared pieces — video player, websocket client, weather |

This is a **multi-tenant** application: `VITE_INSTANCE` selects which tenant's
branding and configuration the build serves.

## Requirements

- Node.js 18 or later
- A running [Aru-Server](https://github.com/Kesowa/Aru-Server) instance
- A TiTiler/COG service for raster tiles, and MinIO or S3 for object storage
- API keys for Mapbox, Google Maps and OpenWeather

## Getting started

```bash
npm install          # .npmrc sets legacy-peer-deps; the tree needs it
cp .env.development .env
# edit .env — see Configuration below. You need your own API keys.
npm start            # Vite dev server
```

Other scripts:

```bash
npm run build         # production bundle
npm run serve         # preview the built bundle
npm run lint:check    # eslint + prettier, no changes
npm run lint:fix      # eslint + prettier, write changes
npx playwright test   # end-to-end tests
```

## Configuration

Configuration is environment variables read by Vite. **Anything prefixed
`VITE_` is compiled into the browser bundle and is therefore public** — never
put a server-side secret in one.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Aru-Server API base URL |
| `VITE_BASE_URL` | base path the app is served from |
| `VITE_PUBLIC_URL` | public origin of the deployment |
| `VITE_COG_URL` | TiTiler / COG tile service |
| `VITE_TITILER_STATIC` | object-store prefix TiTiler reads rasters from |
| `VITE_STATIC_URL` | object-store URL for static assets |
| `VITE_LIVE_URL` | live streaming service |
| `VITE_RTMP_URL` | RTMP ingest endpoint |
| `VITE_INSTANCE` | tenant identifier |
| `VITE_ENV` | `development` or `production` |
| `VITE_VERSION` | version string shown in the UI |
| `VITE_MAPBOX_API_KEY` | Mapbox GL public token (`pk.*`) |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API key |
| `VITE_SITE_KEY` | reCAPTCHA site key |
| `VITE_SECRET_KEY` | reCAPTCHA key — see the warning below |

### ⚠️ About the API keys in this repository

**`.env.development` is committed to this repository and contains real API
keys.** They are Kesowa's development keys and are being rotated. If you are
building on this code, **replace every key with your own** — do not rely on
these, and do not assume they will keep working.

Two things worth understanding:

1. **A `VITE_`-prefixed key is never secret.** Vite inlines it into the built
   JavaScript, so any key here is readable by anyone who opens devtools on a
   deployed build. That is unavoidable for a browser map client. The protection
   is not secrecy but **restriction**: lock Mapbox tokens to your URLs and
   Google Maps keys to your HTTP referrers, in the respective consoles.
   OpenWeather supports no such restriction, so treat that key as spendable by
   anyone who sees it.

2. **`VITE_SECRET_KEY` is misnamed and must not hold a real reCAPTCHA secret.**
   A reCAPTCHA secret key is for server-side verification and would be exposed
   by being in a `VITE_` variable. The committed value is Google's published
   *test* key, which always validates — meaning CAPTCHA is effectively disabled
   in this configuration. Verification belongs in Aru-Server.

See [SECURITY.md](SECURITY.md) for how to report a key you find here.

## Deployment

The `Dockerfile` builds the bundle and serves it with nginx using the included
`nginx.conf`. Because `VITE_*` values are baked in at build time, **each tenant
and environment needs its own build** — you cannot swap configuration at
runtime.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports go through
[SECURITY.md](SECURITY.md), not public issues.

## License

Released under the [MIT License](LICENSE). © Kesowa Infinite Ventures.
