import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { executeListTestRuns } from "./tools/list-test-runs-tool.js";

const server = new McpServer({
  name: "ai-qa-agent-mcp",
  version: "0.1.0",
});

server.registerTool(
  "list_test_runs",
  {
    title: "List Test Runs",
    description:
      "Find available Playwright JSON and JUnit test-result files in the approved reports directory.",
  },
  async () => {
    try {
      const result = await executeListTestRuns();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      return {
        content: [
          {
            type: "text",
            text: `Unable to list test runs: ${message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

async function main(): Promise<void> {
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