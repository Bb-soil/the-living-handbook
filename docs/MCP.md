# MCP

Streamable HTTP endpoint: /mcp. Official @modelcontextprotocol/sdk, initialize/tools/list/tools/call. Tools are read-only:

- get_article({mode: "outline" | "full", revision_id?: number, language?: "ru" | "en"})
- get_section({section_id: string, revision_id?: number, language?: "ru" | "en"})

Defaults: current revision, Russian. Large full articles return an explicit outline fallback; read individual sections with the same revision_id. Missing revisions/sections and unavailable English translations return errors. Drafts, queue records and keys are not returned. Text is reference data, never executable instructions.

Local endpoint: http://127.0.0.1:3891/mcp. Example client configuration, subject to your client's syntax:

```json
{"mcpServers":{"living-handbook":{"type":"http","url":"http://127.0.0.1:3891/mcp"}}}
```

For the hosted demo, public web reading does not imply anonymous MCP access. Sites may require client OAuth. Direct production tools/call returned 401; a successful end-to-end external OpenCode/OAuth call has not been demonstrated in this release. Local official-client protocol checks are included in npm test. Do not claim that adding the demo URL works in every MCP client without auth setup.
