# AiNspire

A Sites rebuild of the attached original React application, preserving its design with the six-question rapid assessment and governed Adaptive Reflection flow.

## Run and verify
Use the configured pnpm package manager. `pnpm dev`, `pnpm check`, `pnpm test`, `pnpm build`.

## Staff ID views (local simulation)
Enter a Staff ID in the top-left of any page and the tabs follow it: everyone gets Employee View, anyone with direct reports also gets Supervisor View, and HR staff also get HR View. A supervisor or HR person is also an employee, so Employee View is always available. The Samples menu next to the input offers the four role combinations plus ten more examples (different divisions, personas, ready or developing, pending assessments, a division head with 94 reports). Once signed in, the work-context form is prefilled and locked with your name, division and position from the directory. Direct visits to `/hr` or `/supervisor` show a notice instead of the dashboard when the Staff ID lacks that view. The supervisor page currently uses the existing POC dashboard; it does not show a database-backed team list. This is a simulation for demos, not authentication: there is no password, and the sample directory is synthetic.

It needs a local Postgres named in `DATABASE_URL` and two commands, run from `v2/`:

```sh
pnpm demo-seed   # drops and recreates only the ainspire_demo schema, then seeds 16,720 sample employees
pnpm demo-api    # loopback-only directory API on 127.0.0.1:8787, proxied by the dev server
```

The seed refuses non-local databases and leaves other schemas alone. If `demo-api` is not running, the Staff ID control is hidden and the app falls back to its previous ungated behaviour. `pnpm test:demo` runs the API role-matrix tests against the seeded database.

For a temporary trusted-LAN preview on macOS, set your current Mac Wi-Fi IP in both variables and run from `v2/`:

```sh
AINSPIRE_DEV_LAN=1 AINSPIRE_DEV_ORIGIN=http://192.168.1.20:5173 pnpm dev
```

Replace `192.168.1.20` with the address from `ipconfig getifaddr en0`. Share `http://<that-ip>:5173` with a teammate on the same non-isolated Wi-Fi. The opt-in binds Vite to all interfaces but allows the exact preview origin for CORS; stop the dev server when finished. This is for trusted local demos only, not production hosting.

## Server AI configuration
Set `GIGX_API_KEY` as a Sites runtime secret to use GiGX as the primary LLM. The default endpoint is `https://gigx.nexa-dev.tm.com.my/llm/v1/chat/completions` and the default model is `qwen3-vl-4b-instruct`; optional overrides are `GIGX_API_URL` and `GIGX_LLM_MODEL`.

Configure `TM_APIGATE_CLIENT_ID`, `TM_APIGATE_CLIENT_SECRET`, and `TM_APIGATE_CHAT_KEY` as fallback secrets. Optional API Gateway overrides are `TM_APIGATE_TOKEN_URL`, `TM_APIGATE_API_URL`, and `TM_LLM_MODEL`. If GiGX fails, the server tries API Gateway; if both fail, classification retains its deterministic profile fallback. Never put either provider's credentials in source control.

**Local development behind the TM VPN:** the local Worker runtime rejects the TM provider certificates (`self signed certificate in certificate chain`), so both providers show as failed. Run `pnpm llm-proxy` in a second terminal and set `LLM_DEV_PROXY_URL=http://127.0.0.1:8788` in `.env`. The relay listens on loopback only, accepts POSTs only to the configured provider hosts, and skips TLS verification for those hosts alone. It refuses to start with `NODE_ENV=production`, and the app ignores `LLM_DEV_PROXY_URL` in production. Restart `pnpm dev` after changing `.env`.

`YOUTUBE_API_KEY` and `YOUTUBE_API_KEY_BACKUP` enable live learning-video search with quota/network fallback to curated resources. `DATABASE_URL` is listed for environment parity with v1 but is not consumed by this v2 POC; assessment/POC records remain in browser storage and HR workforce data remains illustrative demo data.

Without credentials, the assessment remains usable with a labelled deterministic profile. Team dashboards are illustrative demo data. Assessment responses are not persisted on a server. The contact form opens a draft in the user's email app.

`GET /api/health` exposes assessment version and runtime feature metadata. `POST /api/classify` requires version `2026-10-rapid-v2`, department, role, EN/BM language and exactly six question/option pairs. Optional reflection must match the server-selected governed category.

## Power Automate email notifications
Set `POWER_AUTOMATE_TRIGGER_URL` as a server-side Sites runtime secret (or in local `.env`) to enable employee-journey emails. Configure the HTTP-trigger cloud flow and its seven-day reminder branch using [POWER_AUTOMATE.md](POWER_AUTOMATE.md). The app fixes recipients server-side: assessment results and project interest go to the configured employee with the supervisor and HR copied; learning milestones and the scheduled reminder go to the employee with the supervisor copied. These events do not require a demo Staff ID and are only raised from Employee View actions. Emails use the portal's navy/cyan/violet styling and include the portal link. If the flow URL is absent or the flow fails, the assessment and saved progress continue normally.

See TECHNICAL_CHANGELOG.md for rules, limitations and next calibration work.

## YouTube learning links
The learning path includes source-verified curated YouTube cards without API keys. For live topic searches, set `YOUTUBE_API_KEY` and optionally `YOUTUBE_API_KEY_BACKUP` as Sites runtime secrets. Search failures and quota limits fall back to curated cards. Thumbnails use the restored server proxy. UI explanations are EN/BM; the video lessons are in English.

## FastMCP learning server
The separate Python service in `mcp-server/` exposes the learning catalogue to MCP hosts. It does not change the portal's current recommendation flow; the portal continues to use its curated learning-resource mapper.

From `v2/mcp-server/`, create an environment and install the service:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[dev]'
```

Run it over local stdio for an MCP host:

```sh
.venv/bin/ainspire-learning-mcp
```

The server exposes `get_learning_path` and `search_learning_videos` tools, plus the `learning://catalog/{language}` resource. Video search uses `YOUTUBE_API_KEY` and then `YOUTUBE_API_KEY_BACKUP`; with no keys or on API failure it returns curated links. Configure keys in the MCP host's server environment, not in source control.

For local Streamable HTTP testing, run `.venv/bin/ainspire-learning-mcp --transport http --host 127.0.0.1 --port 8765`; the MCP endpoint is `http://127.0.0.1:8765/mcp`. Keep this loopback-only unless authentication and deployment controls are configured. The server sends only persona, language, and capability-dimension labels to YouTube; do not send names, answers, or other identifying data.
