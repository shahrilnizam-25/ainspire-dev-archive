# AiNspire — Source Code Export

Website: https://ainspire.sooct2003.chatgpt.site/
Site version observed at export: 143
Export date: 11 October 2026 (Malaysia)

## Local setup

Install Node.js 22.13 or newer, and the package manager pinned in package.json: pnpm 11.25.0. Use a terminal in this folder:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by the development server (normally http://localhost:5173).
Employee View is `/`, HR View is `/hr`, and Supervisor View is `/supervisor`.

For verification:

```sh
pnpm check
pnpm test
pnpm build
```

Keep the pnpm lockfile; do not mix npm and pnpm lockfiles. Dependencies are downloaded during installation and are not bundled.

## What is included

- app/: pages and server API routes
- src/: assessment UI, dashboards, learning, contribution workflows and report generation
- server/: governed assessment logic, optional TM Gateway and YouTube integration
- public/: images, branding and PDF fonts
- build/, scripts/: Vinext / Cloudflare integration and development tooling
- tests/: assessment, gateway and navigation tests
- configuration files, pnpm lockfile and original project documentation

## Optional API configuration

The POC works without API keys using governed rules and curated videos. For optional integrations, copy `.env.example` to `.env.local`, provide your own credentials and restart the development server. Never commit real credentials. See README.md for supported settings.

## Current POC scope

Employee, HR and supervisor records use browser localStorage. Supervisor routing is simulated; notifications, authenticated organisational approvals and cross-device synchronisation are not implemented. Dashboard sample figures are illustrative. Profile confidence indicates evidence consistency and is not certification of competence. TM Gateway enrichment and live YouTube search require separately supplied credentials.

POC_GUIDE.md and TECHNICAL_CHANGELOG.md preserve historical development notes; some descriptions precede the latest UI. Use the current source and this export guide for the final behavior.

## Export provenance

This ZIP contains the current clean checkout source, without modifying the live website. Source revision: 62d91502f2b9b75077a5d0e04716e8aab8947d3b.
Generated build output, node_modules, Git history, browser records and private runtime state are excluded. The export's `.openai/hosting.json` retains only empty D1/R2 configuration so it does not carry the original Site identity. Hosting elsewhere requires its own deployment configuration.
