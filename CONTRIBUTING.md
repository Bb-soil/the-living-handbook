# Contributing

For article edits, see [content guidelines](content/CONTRIBUTING.md) or suggest an edit on the live site. RU is the editorial source; EN is a generated translation.

For code, describe the problem and observable behavior, keep changes scoped, run npm ci and npm run check, and state what was not tested. Tests must detect meaningful failures rather than mirror the implementation. Do not weaken auth, conflict detection, immutable history or provider budgets to make a test pass.

Never include runtime SQLite/D1 dumps, API keys, private submissions, receipt links or generated bundles in a PR. The local preview and fixture providers must remain separate from production. Code licensing is documented in LICENSE_SCOPE.md.
