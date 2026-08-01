import { extname } from "node:path";

import { parseJUnitXmlReport } from "../parsers/junit-xml-parser.js";
import { parsePlaywrightJsonReport } from "../parsers/playwright-json-parser.js";
import type { TestRun } from "../types/test-result.js";

export async function parseTestRunReport(
  filePath: string,
): Promise<TestRun> {
  const extension = extname(filePath).toLowerCase();

  switch (extension) {
    case ".json":
      return parsePlaywrightJsonReport(filePath);

    case ".xml":
      return parseJUnitXmlReport(filePath);

    default:
      throw new Error(
        "Unsupported report format. Supported formats are Playwright JSON and JUnit XML.",
      );
  }
}