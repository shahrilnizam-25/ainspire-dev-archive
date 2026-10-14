# AiNspire rapid assessment rebuild — 6 October 2026

The attached ZIP remains the design source: original React screen layouts, dark navy/cyan/violet styling, hero-v5 image, logos, personas, report export and workforce dashboard components are retained. Replit/Express deployment plumbing is adapted to the Sites Vinext/Workers runtime.

## Implemented
- GiGX is the primary OpenAI-compatible LLM provider (`qwen3-vl-4b-instruct` by default). TM API Gateway remains the automatic fallback when GiGX fails; deterministic classification remains the fallback if no provider succeeds. Both provider credentials are runtime secrets, never source constants.
- Six bilingual structured questions: AI Exposure, AI Application, Critical Judgement, AI Problem Solving, AI Contribution Style, Growth Aspiration.
- Landing duration: approximately two minutes, with one additional short reflection only when ambiguity triggers it.
- Shared deterministic Adaptive Reflection decision layer and real AdaptiveReflectionScreen. Only one category/prompt can be selected: Capability, Contribution or Growth. Consistent profiles go directly to the pledge. Skipping reflection preserves an unresolved-review flag.
- API accepts exactly six distinct valid question/option pairs. Server reconstructs scores and wording from the governed bank rather than trusting client evidence. Version, role, department, language and reflection category/length are validated.
- Five maturity dimensions are averaged. Contribution Style is displayed categorically and excluded from scoring; a Business Problem Owner is not penalised for preferring business ownership.
- Persona uses application/problem-solving/judgement patterns plus contribution style, rather than overall maturity bands. Role seniority and growth aspiration cannot automatically confer a senior persona.
- Optional reflection reaches the LLM as supplementary participant evidence. It cannot override structured scores or the governed persona. Reflection remains available for human review.
- TM Gateway adapter retained on the server. Without TM credentials, the site returns a labelled deterministic developmental profile and learning pathway. A Gateway failure also falls back safely. No model credentials are embedded in source.
- Added a standalone Python FastMCP learning server exposing bilingual learning-path and learning-video tools plus a learning-catalog resource. stdio is the default local transport; optional Streamable HTTP binds to loopback by default. YouTube keys stay in process environment variables, with curated fallback when keys are absent or requests fail. This service is separate from the portal UI, which continues to use curated recommendations unless wired to an MCP client in a separate change.
- EN/BM results are requested concurrently and cached. Identical structured choices preserve persona/scores across languages.
- Five numeric dimensions plus the categorical contribution dimension appear in the report. Existing PDF download design is retained.
- Existing workforce statistics and HR records remain illustrative demo data and are labelled. No employee database or persistent assessment collection is added.
- Existing contact form opens an email draft; copy now states that the webpage has not sent the message.

## Provisional rules and next calibration
The exact six-question option wording and detailed new trigger thresholds were not present in the attached ZIP or retrieved prior discussion. The implementation supplies bilingual wording and explicit provisional rules aligned to the user's six named dimensions and agreed constraints. Review these with the AiNspire assessment owner before treating them as validated psychometrics.

1. Calibrate each question/option with HR, AI specialists and business problem owners; confirm EN/BM equivalence.
2. Test the Capability, Contribution and Growth trigger thresholds against labelled employee profiles and actual reflection rates. The combinatorial test is not a prediction of user incidence.
3. Validate persona patterns with representative technical and nontechnical roles; review business-owner fairness and mixed-signal cases.
4. Profile-signal values are uncalibrated evidence-consistency heuristics, not probabilities of correctness. Replace with empirically validated confidence only after labelled evaluation.
5. Validate LLM evidence reconciliation, prompt-injection resistance, language quality and error fallback against the approved TM Gateway environment. A mocked gateway test verifies the reflection payload and baseline protections; live credentials are not supplied.
6. Replace illustrative dashboard data with an approved authenticated data pipeline when separately scoped.

## Verification
TypeScript check, production build and eight automated assessment/API tests. Tests cover bilingual identity, contribution fairness, pattern-based persona selection, all reflection categories, direct-path combinations, canonical validation, real API payload acceptance/rejection, and mocked LLM reflection delivery. Browser QA is unavailable because the required managed control-browser capability is not available; no visual parity or browser PDF-export test is claimed.

## Profile Fit display correction
The retained results badge previously converted missing personaScores to 0%. The rapid classifier deliberately does not produce numerical persona-fit percentages. The badge now shows Pattern-based profile (or Review recommended for mixed signals) when the score is absent. Genuine finite scores within 0–100, including an actual zero, remain distinct from unavailable data. EN/BM wording is updated; classification and maturity scores are unchanged.

## YouTube and Adaptive Reflection restoration
Restored YouTube video metadata and thumbnail proxy in the Sites runtime. Source-verified curated Google Cloud/Microsoft course links render immediately without credentials; configured primary/backup YouTube Data API keys enable live topic search, with curated fallback on quota or network failure. Existing text learning actions remain alongside videos, and model responses cannot discard the video links. Sources: https://www.youtube.com/watch?v=G2fqAlgmoPo ; https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/04-prompt-engineering-fundamentals/README.md ; https://raw.githubusercontent.com/microsoft/generative-ai-for-beginners/main/06-text-generation-apps/README.md ; https://learn.microsoft.com/en-my/shows/generative-ai-for-beginners/ .

The supplied New assessment approach in AiNspire deck identifies conflicting leadership evidence despite limited hands-on use and the hidden-builder scenario. Expanded Contribution triggers for low exposure/application combined with strong problem-solving/judgement and strategic/champion contribution. Low application/problem-solving with builder preference now receives the Capability prompt. Clear profiles still skip reflection; the pledge screen explains the chosen path and whether reflection was supplied or skipped. Maximum one prompt and server category validation remain unchanged. TM Gateway credentials remain absent; deterministic results include the reflection for human review rather than claiming automated semantic persona refinement.

Recommended future positioning, not implemented in this fix: employee Project Contribution Match after Learning Path; manager Project Matching tab in HR Manager View. Value Realization as a manager tab with baseline/reassessment capability metrics and evidence-backed project outcomes; personal contribution status for assigned employees. Manager review precedes assignment; financial value requires an approved valuation basis and validation. No readiness-to-RM conversion or illustrative values labelled as actual realization.

Verification: TypeScript, production build, and ten assessment/API tests including video linkage without credentials, quota/backup behaviour and deck-specific reflection scenarios. Browser QA remains unavailable in the managed environment.

## Employee navigation, HR separation and contribution offers — 6 October 2026
- Every assessment question now has Back and explicit Next/Continue controls. Options remain editable. Answers are upserted in governed question order so revisiting a question preserves later choices and never creates duplicate answers. Question 1 returns to the department form with its saved values. Changes invalidate the previous written reflection.
- Section headings use a prominent numbered panel with the dimension name and overall question progress. Original dark/cyan/violet design remains.
- Platform branding updated to TM AI Workforce Intelligent & Capability Development Platform. Explanation heading renamed PROFILE REASONING, accurate for both deterministic and AI-assisted execution.
- Employee portal remains at `/`; manager dashboard and workforce statistics now live at `/hr`. Employee results no longer contain HR analytics navigation or a current-employee row injected into manager demo data. This separates the user interfaces; authenticated employee/HR role enforcement is not implemented. Existing private Sites access remains unchanged.
- Added employee Project Contribution Match immediately after the learning path: two explicitly illustrative initiative offers, suggested contribution roles, scope/support/value-measure details, Accept/Decline and Change response. Responses are stored locally by persona as demo choices, with session-only fallback when browser storage is unavailable. No notifications, actual assignments or realized benefit records are created.
- Replaces the previous note that employee project matching was entirely unimplemented. Manager project matching and actual Value Realization remain future integrations. Mock offer details show proposed time/quality/adoption measures, without claiming measured savings.
- Verification: TypeScript passes; eleven automated assessment/API tests pass, including revised-answer preservation and canonical six-answer validation. Production build is run in the Sites publishing workflow. Browser interaction and visual QA remain unavailable in the managed environment.

## Structured views, profile readability and project interactions — 6 October 2026
- Added explicit Employee View / HR View navigation and two landing sections describing each audience. Separate manager route and private audience retained; no authenticated HR role enforcement added.
- PROFILE REASONING now presents numbered explanations, strengths/development columns, all five capability dimensions, and an enlarged contribution-style card with a cyan glow outline. Your Reflection uses a responsive context/written-evidence column layout with preserved line breaks and readable spacing; direct/skipped reflection states are explained.
- Redesigned employee project mock offers with summary counters, All/Accepted/Declined filters, per-offer Role & Fit / Scope & Support / Value Measures controls, persistent response indicators, and change-response actions. Existing browser-local demo decisions preserved. No actual offers or assignments are created.
- Verified deployed environment revision 0 has no runtime variables: live YouTube API search is not configured. Curated videos therefore remain the deployed recommendation source. Added explicit source/fallback badges and assessment-specific Search YouTube links that work without an API key.
- Search query now targets the two lowest capability dimensions (excluding contribution preference and growth aspiration), with persona context. API requests use relevance ordering and playable/embeddable-video filters. Curated selection accounts for foundational gaps. Relevance explanations identify learning focus; this does not claim human-reviewed suitability of live search results.
- API key/backup paths and network/quota fallback are tested with mocked responses; no credential-backed live YouTube API call is claimed. Reference: https://developers.google.com/youtube/v3/docs/search/list .
- TypeScript, assessment/API regression tests and production build checked. Browser visual/interaction QA is unavailable under the managed Sites workflow.

## URL and landing scope simplification — 6 October 2026
- Site URL label changed using Sites hosting controls from ainspire-rapid-assessment to ainspire; same project and current public audience retained. Confirmed URL: https://ainspire.sooct2003.chatgpt.site .
- Hero headline/subheading intentionally retained pending the user's explicit selection of a new phrase.
- Landing scope strip now covers Understand Your AI Profile, Develop Your AI Capability, Find Your Project Role, and Plan Workforce Development. Wording describes the six questions/optional reflection, learning gaps, illustrative project offers and demo HR workforce insights accurately in EN/BM. Four cards use a responsive layout and improved text readability.
- Removed redundant Employee View/HR View landing cards and separate HR Manager Portal CTA. The top-left view switcher remains the single audience navigation control.
- HR view switcher moved out of the manager header into the same top-left layout as Employee View; EN/BM controls remain at top right.
- TypeScript and production build verification; browser visual checks remain unavailable.

## Employee benefit exploration — 6 October 2026
- Replaced the dense scope strip identified in the user's screenshot with an interactive employee-benefit section: Know Your AI Strengths, Build Skills That Matter, Put Your Skills to Work, Grow with Your Team.
- Each keyboard-accessible card selects an inline detail panel with a clear takeaway, two personal benefits and a practical explanation. Selection highlights and explored-card progress encourage exploration without blocking assessment access. Existing hero wording remains pending selection.
- EN/BM content uses employee-oriented language while retaining the six-question/optional-reflection scope and accurate curated/search-video status. Project and HR demos remain explicitly labelled; no actual employee records or assignments are implied.
- Preserved original dark/cyan/violet styling, top-left view navigation and assessment CTA. Cards stack responsively and avoid narrow icon/text columns.
- TypeScript and production build checked. Browser visual and interaction QA is unavailable in the managed workflow.

## Simplified scope cards following employee UX feedback — 6 October 2026
- User clarified that the benefit exploration added excessive content and interaction. Replaced the expanded experience with four compact scope cards matching the supplied reference's original scope titles and wording.
- Removed benefit-section headline, detail panel, practical examples, exploration progress/checks and selectable-card behavior. Preserved the existing assessment CTA and hero.
- Visual refinements only: balanced spacing, icon tiles, rounded borders, readable full-width text, cyan/violet/green/blue accents and restrained hover styling. Cards are informative articles, with no misleading click affordance. Responsive two/four-column layout retained and EN/BM governed text reused.
- TypeScript and production build verification; browser visual QA remains unavailable.

## Approved hero phrase — 6 October 2026
- User selected Option 1. Hero now reads “Unlock Your AI Potential” with “Build Capability. Contribute with Impact.”
- Introductory line updated to “Discover your strengths, develop your AI capability, and explore where you can contribute to TM’s AI future.” Equivalent BM copy supplied.
- Existing hero styling and compact scope cards retained. TypeScript and production build checked; browser visual QA unavailable.

## Hero introductory line placement — 6 October 2026
- Moved the smaller introductory sentence after the hero headline and supporting line, with spacing and a readable maximum width. Applied shared EN/BM layout.
- Kept the approved main headline. Supporting-line alternatives are proposed to the user for selection; the supporting copy is not replaced before selection.
- TypeScript and production build checked. Browser visual QA unavailable.

## Revised supporting line and hero reading order — 6 October 2026
- User selected supporting Option 1: “Grow Your Skills. Shape TM’s AI Future.” Updated equivalent BM wording.
- Recommended and retained the introduction immediately below the supporting line and before the scope cards. Hero reading order: potential → personal growth/TM direction → explanation → scopes/assessment action.
- Intro uses sentence case, smaller readable body text and a constrained width, keeping it visibly secondary to the headline/supporting line. No new sections or interactions added.
- TypeScript and production build checked; browser visual QA unavailable.

## Introduction above scope cards — 6 October 2026
- Moved the existing introductory sentence out of the hero headline block to directly above the four scope cards, within the transparent scope section.
- Centered readable EN/BM text with clear spacing and a restrained cyan text glow; no separate panel/background added. Hero headline and supporting line retained.
- TypeScript and production build checked; browser visual QA unavailable.

## Staff ID views and sample org database — 12 October 2026
- Added a local Postgres org simulation (`ainspire_demo`): 16,720 sample employees across the 14 TM divisions with a manager hierarchy and an HR flag. Division, assessed and ready counts match the existing dashboards (5,603 assessed, 4,258 ready) and are derived by views, so they cannot drift from the population. `pnpm demo-seed` recreates only this schema and refuses non-local databases; v1 `public` tables are untouched.
- Added `scripts/demo-api.mjs`, a loopback-only Node API (Vite proxies `/api/demo`). A Staff ID creates a signed HttpOnly session; supervisors can read only their direct reports and only HR can read the workforce table, both enforced server-side. This is demo access control, not authentication.
- The first page now asks for a Staff ID. The top-left tabs show the views the ID holds (Employee; plus Supervisor with direct reports; plus HR for HR staff), and `/hr` and `/supervisor` do not render their dashboards without that access. If the API is not running, the previous ungated behaviour is kept.
- Added the missing `DatabaseDemoPanel`, which had been imported by the landing and HR pages without existing and broke type checking.
- Limits: the existing HR and supervisor dashboards still read their browser-local POC and generated demo data; only the new panels read the database. Assessment answers are not yet written to Postgres.
- Verified: type check, 57 tests (4 new access-rule tests), production build, API role matrix including forged cookie and cross-origin refusal, and a browser walk-through of all four role combinations.

## Staff ID entry moved to the tab bar; removed sample panels — 12 October 2026
Supersedes the UI described in the previous entry.
- Removed the landing-page "PostgreSQL simulation" snapshot and the large Staff ID card, and the HR page's "Organization workforce" panel (it repeated figures the HR dashboard already shows). The `/api/demo/organization` and `/api/demo/workforce` endpoints and the `DatabaseDemoPanel` file are gone.
- Staff ID entry is now a compact control in the top-left tab bar, with a Samples menu labelled by role: Employee, Employee + Supervisor, Employee + HR, Employee + Supervisor + HR. Signed-in users see their name, ID and a Switch button. A supervisor or HR person is also an employee, so Employee View is always present; no separate employee-plus-supervisor identity type is needed.
- `/hr` and `/supervisor` show a short notice (sign in, or not permitted) instead of a dashboard when the Staff ID lacks the view. The supervisor page keeps a team panel read from Postgres, limited to that supervisor's direct reports. The HR dashboard still uses its existing browser-local and generated data.
- Fixes: the signed-out session probe now returns 200 `{signed_in:false}` instead of a 401, which logged a red console error on every page load; the Samples menu no longer runs off the right edge on phones (checked 320 to 1156px); the two recharts charts get an initial size, removing a width(-1)/height(-1) warning; logout answers a true bodiless 204.
- Tests: added `pnpm test:demo` (10 API role-matrix tests: all four role combinations, wrong or injected IDs, forged cookies, cross-origin, content type, body size, rate limit, 204 logout). It needs the seeded local Postgres, so it is not part of `pnpm test`.
- Not from this app: an "Unhandled promise rejection: Cannot read properties of undefined (reading 'M_ID')" overlay seen in development comes from a Chrome extension (`chrome-extension://nimlmejbmnecnaghgmbahmbaddhjbecg/executors/200.js`); the string does not exist in this project. Disable that extension for localhost or use a clean browser profile.

## Prefilled work-context form and wider sample set — 12 October 2026
- A signed-in Staff ID now prefills the "Where do you create value?" form with name, division and position from the directory, locked and labelled with the Staff ID. The values are used only when the division matches a form option, otherwise the form stays editable. Switching Staff ID resets the form. Verified that the classify requests carry the directory division and role for both EN and BM.
- The Samples menu lists the four role combinations plus ten examples across divisions: ready Builder, Strategist and Visionary profiles, developing Explorer and Strategist profiles, two pending assessments, a division head with 94 reports, a small-division manager, and the HR division head. Examples are chosen by static SQL conditions, lowest Staff ID first, so they are stable between runs.
- The API test now also covers the examples (unique IDs, all four personas, pending, developing, large team, HR supervisor), that every sample signs in with the views it claims, and that every division matches a form option. The rate-limit test runs against its own default-limit server (30 per minute, the 31st is refused); the main test server raises the limit through `DEMO_API_MAX_ATTEMPTS`, an override only the tests set.
- Limit: completing an assessment does not yet update the directory, so a "pending" sample stays pending in the supervisor's team table.
