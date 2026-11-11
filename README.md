# opslab-web

Web UI of opslab (working name). It's a React + Vite single-page app built with the [Mantine](https://mantine.dev) component library. The [api](https://github.com/Sigeth/opslab-api) serves the built files in production.

> Status: M1. Login (solo mode), challenge catalog, and a challenge page with the instructions, the tasks, the environment (start, countdown, stop), browser terminals and a *Check my work* button. Live updates come from the api's server-sent events.

## Pages and building blocks

| Route | Page |
|---|---|
| `/login` | `LoginPage` |
| `/` | `CatalogPage`: a `ChallengeCard` per challenge |
| `/challenges/$name` | `ChallengePage`: `Instructions`, `TaskList`, `InstancePanel`, `TerminalPanel` (xterm.js), `CheckButton` |

Terminals connect straight to the gateway (`wss://gw.<domain>/v1/terminal?token=…`) with a short-lived token from the api.

## Conventions (keep every page consistent)

- **Look:** `src/theme.ts` is the only place that defines colors, fonts, radius and spacing. ESLint rejects inline `style` props and hard-coded hex colors.
- **Layout:** every route is a child of the root route, so it renders inside `AppLayout` (header + navigation).
- **Building blocks:** pages use `src/components/` (e.g. `PageHeader`) and Mantine components. They never use raw HTML and CSS.
- **API:** `src/api/schema.d.ts` is generated from the api's OpenAPI document (`make generate`). Call the api through `src/api/client.ts` (typed `openapi-fetch`) and TanStack Query hooks in `src/api/queries.ts`.
- **Routing:** TanStack Router, declared in `src/router.tsx`.

## Development

Requirements: Node.js 24, make.

```sh
make install
make dev                                      # http://localhost:5173, proxies the api on :8080
make lint test build
OPENAPI_FILE=../api/openapi.json make generate  # after an api change (default: the tag in API_VERSION)
```

## License

[MIT](LICENSE)
