import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { XMLParser } from "fast-xml-parser";

import type {
  JUnitAttributeValue,
  JUnitIssueNode,
  JUnitReportDocument,
  JUnitSkippedNode,
  JUnitTestCaseNode,
  JUnitTestSuiteNode,
} from "../types/junit-report.js";
import type {
  NormalizedTestResult,
  TestError,
  TestRun,
  TestStatus,
} from "../types/test-result.js";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true,
  parseTagValue: false,
  trimValues: true,
});

function toArray<T>(
  value: T | T[] | undefined,
): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toOptionalString(
  value: JUnitAttributeValue | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = String(value).trim();

  return normalizedValue || undefined;
}

function secondsToMilliseconds(
  value: JUnitAttributeValue | undefined,
): number {
  if (value === undefined) {
    return 0;
  }

  const durationSeconds = Number(value);

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds < 0
  ) {
    return 0;
  }

  return Math.round(durationSeconds * 1000);
}

function containsTimeoutEvidence(
  issueNodes: JUnitIssueNode[],
): boolean {
  return issueNodes.some((issue) => {
    const evidence = [
      toOptionalString(issue["@_type"]),
      toOptionalString(issue["@_message"]),
      toOptionalString(issue["#text"]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return evidence.includes("timeout");
  });
}

function mapTestStatus(
  testCase: JUnitTestCaseNode,
): TestStatus {
  const skippedNodes = toArray<JUnitSkippedNode>(
    testCase.skipped,
  );

  if (skippedNodes.length > 0) {
    return "skipped";
  }

  const errorNodes = toArray<JUnitIssueNode>(
    testCase.error,
  );

  if (
    errorNodes.length > 0 &&
    containsTimeoutEvidence(errorNodes)
  ) {
    return "timedOut";
  }

  if (
    errorNodes.length > 0 ||
    toArray<JUnitIssueNode>(
      testCase.failure,
    ).length > 0
  ) {
    return "failed";
  }

  return "passed";
}

function createTestError(
  issue: JUnitIssueNode,
): TestError {
  const message =
    toOptionalString(issue["@_message"]) ??
    toOptionalString(issue["#text"]) ??
    toOptionalString(issue["@_type"]) ??
    "JUnit test failure without an error message.";

  const stack = toOptionalString(issue["#text"]);

  return {
    message,
    ...(stack && stack !== message
      ? { stack }
      : {}),
  };
}

function collectErrors(
  testCase: JUnitTestCaseNode,
): TestError[] {
  const failureNodes = toArray<JUnitIssueNode>(
    testCase.failure,
  );

  const errorNodes = toArray<JUnitIssueNode>(
    testCase.error,
  );

  return [...failureNodes, ...errorNodes].map(
    createTestError,
  );
}

function createNormalizedTestResult(
  testCase: JUnitTestCaseNode,
  suiteName: string,
): NormalizedTestResult {
  const title =
    toOptionalString(testCase["@_name"]) ??
    "Unnamed JUnit test";

  const file =
    toOptionalString(testCase["@_file"]) ??
    toOptionalString(testCase["@_classname"]) ??
    suiteName;

  const project =
    toOptionalString(testCase["@_project"]) ??
    suiteName;

  return {
    id: `${file}::${title}::${project}`,
    title,
    file,
    project,
    status: mapTestStatus(testCase),
    durationMs: secondsToMilliseconds(
      testCase["@_time"],
    ),
    retry: 0,
    errors: collectErrors(testCase),
  };
}

function parseSuite(
  suite: JUnitTestSuiteNode,
): NormalizedTestResult[] {
  const suiteName =
    toOptionalString(suite["@_name"]) ??
    "JUnit Test Suite";

  const currentSuiteResults = toArray(
    suite.testcase,
  ).map((testCase) =>
    createNormalizedTestResult(
      testCase,
      suiteName,
    ),
  );

  const nestedSuiteResults = toArray(
    suite.testsuite,
  ).flatMap((nestedSuite) =>
    parseSuite(nestedSuite),
  );

  return [
    ...currentSuiteResults,
    ...nestedSuiteResults,
  ];
}

function findFirstTimestamp(
  suites: JUnitTestSuiteNode[],
): string | undefined {
  for (const suite of suites) {
    const timestamp = toOptionalString(
      suite["@_timestamp"],
    );

    if (timestamp) {
      return timestamp;
    }

    const nestedTimestamp = findFirstTimestamp(
      toArray(suite.testsuite),
    );

    if (nestedTimestamp) {
      return nestedTimestamp;
    }
  }

  return undefined;
}

export async function parseJUnitXmlReport(
  filePath: string,
): Promise<TestRun> {
  const xmlContent = await readFile(
    filePath,
    "utf8",
  );

  const document = xmlParser.parse(
    xmlContent,
  ) as JUnitReportDocument;

  const suites = document.testsuites
    ? toArray(document.testsuites.testsuite)
    : toArray(document.testsuite);

  if (suites.length === 0) {
    throw new Error(
      "Invalid JUnit XML report. Expected a testsuites or testsuite root element.",
    );
  }

  const tests = suites.flatMap((suite) =>
    parseSuite(suite),
  );

  const startedAt = findFirstTimestamp(suites);

  const declaredDurationMs = document.testsuites
    ? secondsToMilliseconds(
        document.testsuites["@_time"],
      )
    : secondsToMilliseconds(
        suites[0]?.["@_time"],
      );

  const calculatedDurationMs = tests.reduce(
    (total, test) =>
      total + test.durationMs,
    0,
  );

  return {
    runId: `${basename(filePath)}-${startedAt ?? "unknown-start"}`,
    sourceFile: filePath,
    format: "junit",
    ...(startedAt ? { startedAt } : {}),
    durationMs:
      declaredDurationMs || calculatedDurationMs,
    tests,
  };
}