import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

export interface ReleaseQualityReportPromptInput {
  reportPath: string;
}

export function createReleaseQualityReportPrompt(
  input: ReleaseQualityReportPromptInput,
): GetPromptResult {
  const reportPath = input.reportPath.trim();

  if (!reportPath) {
    throw new Error(
      "A report path is required to prepare the release-quality report.",
    );
  }

  return {
    description:
      "Guides an AI client through reviewing test evidence and preparing an advisory release-quality report.",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Prepare a release-quality assessment for the test report "${reportPath}".

Use only the ai-qa-agent-mcp server capabilities. Do not inspect project files directly.

Follow this workflow:

1. Use get_test_run_summary for "${reportPath}".
2. Use analyze_test_failures for "${reportPath}".
3. Review every failed, timed-out, and flaky test.
4. Use generate_bug_report for each issue that may require defect investigation.
5. Use generate_qa_summary for "${reportPath}".
6. Produce a clear Markdown release-quality report containing:
   - test execution metrics
   - failed, timed-out, flaky, and skipped tests
   - probable failure categories and likely sources
   - draft bug-report details where applicable
   - quality risks ordered by severity
   - the advisory release recommendation and reason
   - unresolved questions or missing evidence
   - a final QA review requirement

Do not invent evidence, test results, defect details, or release conclusions. Clearly distinguish MCP-generated classifications from confirmed findings.

A QA engineer must review the evidence before defects are submitted or a release decision is finalized.`,
        },
      },
    ],
  };
}