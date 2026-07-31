import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { executeGetTestRunSummary } from "./tools/get-test-run-summary-tool.js";
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

server.registerTool(
  "get_test_run_summary",
  {
    title: "Get Test Run Summary",
    description:
      "Read an approved Playwright JSON report and calculate pass, failure, skip, timeout, and flaky-test metrics.",
    inputSchema: {
      reportPath: z
        .string()
        .min(1)
        .describe(
          "Path to the report relative to the approved reports directory, such as json/playwright-results.json.",
        ),
    },
  },
  async ({ reportPath }) => {
    try {
      const result = await executeGetTestRunSummary({
        reportPath,
      });

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
            text: `Unable to summarize test run: ${message}`,
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