import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createReleaseQualityReportPrompt } from "./prompts/release-quality-report-prompt.js";
import {
  latestTestRunResourceUri,
  readLatestTestRunResource,
} from "./resources/latest-test-run-resource.js";
import { executeAnalyzeTestFailures } from "./tools/analyze-test-failures-tool.js";
import { executeGenerateBugReport } from "./tools/generate-bug-report-tool.js";
import { executeGenerateQaSummary } from "./tools/generate-qa-summary-tool.js";
import { executeGetTestRunSummary } from "./tools/get-test-run-summary-tool.js";
import { executeListTestRuns } from "./tools/list-test-runs-tool.js";

export function createAiQaAgentMcpServer(): McpServer {
  const server = new McpServer({
    name: "ai-qa-agent-mcp",
    version: "0.1.0",
  });

  server.registerResource(
    "latest_test_run",
    latestTestRunResourceUri,
    {
      title: "Latest Test Run",
      description:
        "Read the newest supported Playwright JSON or JUnit XML test run from the approved reports directory as normalized QA execution data.",
      mimeType: "application/json",
    },
    async (uri) =>
      readLatestTestRunResource(uri.toString()),
  );

  server.registerPrompt(
    "prepare_release_quality_report",
    {
      title: "Prepare Release Quality Report",
      description:
        "Guide an AI client through analyzing test evidence and preparing an advisory release-quality report.",
      argsSchema: {
        reportPath: z
          .string()
          .min(1)
          .describe(
            "Path to the report relative to the approved reports directory, such as json/playwright-results.json or junit/junit-results.xml.",
          ),
      },
    },
    ({ reportPath }) =>
      createReleaseQualityReportPrompt({
        reportPath,
      }),
  );

  server.registerTool(
    "list_test_runs",
    {
      title: "List Test Runs",
      description:
        "Find available Playwright JSON and JUnit XML test-result files in the approved reports directory.",
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
        "Read an approved Playwright JSON or JUnit XML report and calculate pass, failure, skip, timeout, and flaky-test metrics.",
      inputSchema: {
        reportPath: z
          .string()
          .min(1)
          .describe(
            "Path to the report relative to the approved reports directory, such as json/playwright-results.json or junit/junit-results.xml.",
          ),
      },
    },
    async ({ reportPath }) => {
      try {
        const result =
          await executeGetTestRunSummary({
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

  server.registerTool(
    "analyze_test_failures",
    {
      title: "Analyze Test Failures",
      description:
        "Analyze failed, timed-out, and flaky tests from an approved Playwright JSON or JUnit XML report and group them by probable failure category.",
      inputSchema: {
        reportPath: z
          .string()
          .min(1)
          .describe(
            "Path to the report relative to the approved reports directory, such as json/playwright-results.json or junit/junit-results.xml.",
          ),
      },
    },
    async ({ reportPath }) => {
      try {
        const result =
          await executeAnalyzeTestFailures({
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
              text: `Unable to analyze test failures: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "generate_bug_report",
    {
      title: "Generate Bug Report",
      description:
        "Generate a structured draft bug report for one failed, timed-out, or flaky test from an approved Playwright JSON or JUnit XML report.",
      inputSchema: {
        reportPath: z
          .string()
          .min(1)
          .describe(
            "Path to the report relative to the approved reports directory, such as json/playwright-results.json or junit/junit-results.xml.",
          ),
        testId: z
          .string()
          .min(1)
          .describe(
            "The normalized test ID returned by the failure-analysis tool.",
          ),
      },
    },
    async ({ reportPath, testId }) => {
      try {
        const result =
          await executeGenerateBugReport({
            reportPath,
            testId,
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
              text: `Unable to generate bug report: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "generate_qa_summary",
    {
      title: "Generate QA Summary",
      description:
        "Generate a complete QA execution summary from an approved Playwright JSON or JUnit XML report, including metrics, failure analysis, quality risks, Markdown output, and an advisory release recommendation.",
      inputSchema: {
        reportPath: z
          .string()
          .min(1)
          .describe(
            "Path to the report relative to the approved reports directory, such as json/playwright-results.json or junit/junit-results.xml.",
          ),
      },
    },
    async ({ reportPath }) => {
      try {
        const result =
          await executeGenerateQaSummary({
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
              text: `Unable to generate QA summary: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}