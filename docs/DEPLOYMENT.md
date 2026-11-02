# Deploy your own instance

This is the Sites Worker/D1 implementation. The production project ID and credentials were intentionally removed. Existing demo storage and access are not transferred by cloning.

1. Register a new Site through the supported Sites workflow and put its returned project_id into your local .openai/hosting.json. Keep d1=DB and capability mcp. Do not copy the demo's identity.
2. Set PUBLIC_SITE_ORIGIN for the build and APP_ORIGIN for the Worker to your own HTTPS origin. Without overrides, canonical links use the public demo URL.
3. Configure ADMIN_EMAIL, a stable secret CONFIG_ENCRYPTION_KEY, and optional provider settings in Sites runtime secrets. .env.example documents names; it does not load or deploy secrets. Generate your own 32-byte base64url encryption key. Do not rotate it without migrating encrypted settings.
4. Build with npm run check and use the Sites source/version/deployment workflow. Drizzle migrations live in drizzle/; the platform applies them. Do not edit migrations after application. Runtime seeds only initial article data through INSERT OR IGNORE.
5. Sign in as your configured author and open /admin → API settings. Add your OpenRouter key if AI processing is desired. No real key is needed for local fixture tests.
6. For unattended processing, link your own hourly Sites task and configure QUEUE_AUTH_TOKEN with your supported service-access token. The task retrieves its token at runtime, keeps it in memory and calls only its own /api/queue/tick with OAI-Sites-Authorization and Authorization bearer headers. Never put it in schedule text or source. A dry_run=true probe writes evidence without AI calls. Test persisted heartbeat separately; creating a schedule is not proof that it ran.

The snapshot is a seed, not a live sync. Do not overwrite current D1 with JSON on each deploy. New translations use the instance's provider key and daily budget. Backups and restore verification are the operator's responsibility and remain unverified for the demo.

Outside Sites, replace trusted identity/header handling, sign-in routes and scheduling before public exposure. Simply deploying this Worker behind arbitrary user-supplied identity headers is unsafe. The preview adapter injects a local test owner and is never a deployment target.
