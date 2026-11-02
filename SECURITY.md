# Security boundaries

Do not open a public issue containing keys, encryption material, identity headers, private receipt tokens or real submission data. Until a private reporting channel is configured, report only a high-level problem and request a private channel.

Hosted owner access depends on Sites-authenticated identity and ADMIN_EMAIL. Ordinary sign-in is not author authorization. Public expensive operations have validation, login, bounded storage, global hourly admission, a daily call cap and a kill switch. There is no guarantee that Jev detects all prompt injections or unsafe advice.

API keys are encrypted in D1 with a stable server AES-GCM key; neither key belongs in Git. A clone cannot decrypt the demo database. Session drafts stay in the browser tab for up to 24 hours and require renewed consent after sign-in.

Never expose scripts/preview.mjs publicly: it injects a test owner. On other hosts, do not trust raw oai-authenticated-user-* headers without an authenticated platform boundary. Verify backup restoration and access controls before using real sensitive data.
