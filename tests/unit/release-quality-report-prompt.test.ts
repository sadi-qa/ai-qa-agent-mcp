import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it } from "vitest";

import { createReleaseQualityReportPrompt } from "../../src/prompts/release-quality-report-prompt.js";

function getPromptText(
  result: GetPromptResult,
): string {
  const message = result.messages[0];

  if (!message) {
    throw new Error(
      "Expected the prompt to contain one message.",
    );
  }

  if (message.content.type !== "text") {
    throw new Error(
      "Expected the prompt message to contain text.",
    );
  }

  return message.content.text;
}

describe("createReleaseQualityReportPrompt", () => {
  it("creates a release-quality workflow for the provided report", () => {
    const result = createReleaseQualityReportPrompt({
      reportPath: "json/playwright-results.json",
    });

    expect(result.description).toContain(
      "release-quality report",
    );

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]?.role).toBe("user");

    const promptText = getPromptText(result);

    expect(promptText).toContain(
      'get_test_run_summary for "json/playwright-results.json"',
    );

    expect(promptText).toContain(
      'analyze_test_failures for "json/playwright-results.json"',
    );

    expect(promptText).toContain(
      "generate_bug_report",
    );

    expect(promptText).toContain(
      'generate_qa_summary for "json/playwright-results.json"',
    );

    expect(promptText).toContain(
      "Do not inspect project files directly.",
    );

    expect(promptText).toContain(
      "Do not invent evidence",
    );

    expect(promptText).toContain(
      "A QA engineer must review the evidence",
    );
  });

  it("trims whitespace from the report path", () => {
    const result = createReleaseQualityReportPrompt({
      reportPath:
        "  json/playwright-results.json  ",
    });

    const promptText = getPromptText(result);

    expect(promptText).toContain(
      '"json/playwright-results.json"',
    );

    expect(promptText).not.toContain(
      '"  json/playwright-results.json  "',
    );
  });

  it("rejects an empty report path", () => {
    expect(() =>
      createReleaseQualityReportPrompt({
        reportPath: "   ",
      }),
    ).toThrow(
      "A report path is required to prepare the release-quality report.",
    );
  });
});