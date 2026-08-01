import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createAiQaAgentMcpServer } from "./mcp-server.js";

async function main(): Promise<void> {
  const server = createAiQaAgentMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(
    "AI QA Agent MCP server is running over stdio.",
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? (error.stack ?? error.message)
      : String(error);

  console.error("Fatal MCP server error:", message);
  process.exit(1);
});