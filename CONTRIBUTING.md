# Contributing

## Getting set up

```bash
npm install          # .npmrc sets legacy-peer-deps=true; the tree requires it
cp .env.development .env
# replace the API keys in .env with your own — see README
npm start
```

You need a running [Aru-Server](https://github.com/Kesowa/Aru-Server) for
anything beyond static rendering, plus a tile service for the map views.

## Branches

`master` is the main line. Feature branches are named after their Jira issue
(`ARU-367-Add-mesurment-tools`). Branch from `master` and open your pull
request against it.

There are a lot of open Dependabot branches. Leave them alone unless you are
specifically doing dependency work.

## Before you push

```bash
npm run lint:check     # eslint + prettier, read-only
npm run lint:fix       # apply fixes
npm run build          # must succeed — the build is memory-hungry, see below
npx playwright test    # end-to-end tests
```

`npm run build` sets `--max-old-space-size=4096` because the bundle is large
enough to exhaust the default Node heap. If the build dies on your machine,
raise it further rather than assuming your change broke something.

CI runs Prettier and will push formatting fixes back onto your branch, so
running `lint:fix` first saves a round trip.

## Style

- TypeScript throughout. Prefer a real type over `any`; if you must use `any`,
  leave a comment saying why.
- Prettier owns formatting — `.prettierrc.json` is the authority. Do not
  hand-format and do not reformat files you are not otherwise changing.
- Ant Design is the component library. Reach for an antd component before
  writing a new one.
- Keep API access in `src/services/`. Components should not construct URLs or
  call axios directly.
- Shared configuration belongs in `src/constants.ts`, not scattered literals.

## Never commit a key

This is the repository's known weak spot, so it is worth being blunt about.

`.env.development` is committed and contains real API keys, and several keys
were also hardcoded directly into `.tsx` components. Both are being cleaned up.
Do not add to the problem:

- Read configuration from `import.meta.env.VITE_*`. Never write a key literal
  into a component.
- **Remember that every `VITE_*` value is compiled into the browser bundle.** It
  is public by construction. A `VITE_` variable is for configuration that is
  fine to publish, with access controlled by restricting the key at the provider
  — Mapbox URL restrictions, Google Maps referrer restrictions — not by hiding
  it.
- Anything that must actually stay secret belongs in Aru-Server, behind an
  endpoint. reCAPTCHA verification is the canonical example: the secret key is
  server-side, always.
- If you commit a key by accident, say so immediately and get it rotated.
  Removing it in a later commit does not remove it from history, and it was
  readable in the bundle the moment it was deployed.

## Multi-tenancy

`VITE_INSTANCE` selects the tenant, and `VITE_*` values are baked in at build
time, so each tenant gets its own build. A change that assumes a single tenant,
or that reads tenant configuration at runtime, will not work. Check your change
against more than one instance value.

## Pull requests

1. Open or reference an issue for anything beyond a small fix.
2. Keep the change focused. This codebase is large and broad pull requests are
   hard to review.
3. Say what you tested and in which browser. Map and video behaviour varies
   more across browsers than the rest of the app.
4. Include a screenshot or short recording for any visual change.
5. Check your diff for keys, `.env` files and `console.log` calls.

## Things worth fixing

- **Keys hardcoded in components.** The Google Maps key still appears inline in
  several `.tsx` files; those should read from `import.meta.env`.
- **`axios` is pinned at `^0.21.2`**, which is several major versions behind and
  has known advisories. Upgrading it is a real but worthwhile piece of work.
- **`src/components/Map/dist/`** contains build output committed into the source
  tree. It should not be there.
- **Thin test coverage.** There is a Playwright setup and very little using it.
- **`VITE_SECRET_KEY` is misnamed** and invites someone to put a genuine secret
  into a public variable. It should be removed once reCAPTCHA verification moves
  server-side.

## License

Contributions are accepted under the [MIT License](LICENSE) covering this
repository.
