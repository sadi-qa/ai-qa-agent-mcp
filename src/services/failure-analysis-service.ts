import type {
  AnalyzedFailure,
  FailureAnalysis,
  FailureCategory,
  FailureSource,
} from "../types/failure-analysis.js";
import type {
  NormalizedTestResult,
  TestError,
} from "../types/test-result.js";

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function combineErrorText(errors: TestError[]): string {
  return errors
    .map((error) => `${error.message} ${error.stack ?? ""}`)
    .join(" ");
}

function identifyFailureCategory(
  test: NormalizedTestResult,
): FailureCategory {
  const failureText = normalizeText(
    combineErrorText(test.errors),
  );

  if (
    test.status === "timedOut" ||
    failureText.includes("timeout") ||
    failureText.includes("timed out")
  ) {
    return "timeout";
  }

  if (
    failureText.includes("authentication") ||
    failureText.includes("unauthorized") ||
    failureText.includes("invalid credentials") ||
    failureText.includes("login")
  ) {
    return "authentication";
  }

  if (
    failureText.includes("api") ||
    failureText.includes("status code") ||
    failureText.includes("response body") ||
    failureText.includes("http ")
  ) {
    return "api-response";
  }

  if (
    failureText.includes("test data") ||
    failureText.includes("fixture") ||
    failureText.includes("seed data") ||
    failureText.includes("missing data")
  ) {
    return "test-data";
  }

  if (
    failureText.includes("environment") ||
    failureText.includes("browser launch") ||
    failureText.includes("configuration") ||
    failureText.includes("service unavailable")
  ) {
    return "environment";
  }

  if (
    failureText.includes("network") ||
    failureText.includes("connection refused") ||
    failureText.includes("connection reset") ||
    failureText.includes("net::")
  ) {
    return "network";
  }

  if (
    failureText.includes("locator") ||
    failureText.includes("element not found") ||
    failureText.includes("strict mode violation")
  ) {
    return "locator";
  }

  if (
    failureText.includes("expect") ||
    failureText.includes("expected") ||
    failureText.includes("assert")
  ) {
    return "assertion";
  }

  return "unknown";
}

function identifyLikelySource(
  category: FailureCategory,
  test: NormalizedTestResult,
): FailureSource {
  if (
    category === "locator" ||
    category === "test-data" ||
    category === "environment"
  ) {
    return "possible-automation-issue";
  }

  if (
    category === "assertion" ||
    category === "authentication" ||
    category === "api-response"
  ) {
    return "possible-product-defect";
  }

  if (test.status === "flaky") {
    return "possible-automation-issue";
  }

  return "requires-investigation";
}

function getPrimaryErrorMessage(
  test: NormalizedTestResult,
): string {
  return (
    test.errors[0]?.message ??
    "No failure message was provided."
  );
}

function analyzeTestFailure(
  test: NormalizedTestResult,
): AnalyzedFailure {
  const category = identifyFailureCategory(test);

  return {
    testId: test.id,
    testTitle: test.title,
    file: test.file,
    project: test.project,
    status: test.status as "failed" | "timedOut" | "flaky",
    category,
    likelySource: identifyLikelySource(category, test),
    message: getPrimaryErrorMessage(test),
    retry: test.retry,
    durationMs: test.durationMs,
  };
}

export function analyzeFailures(
  tests: NormalizedTestResult[],
): FailureAnalysis {
  const failedTests = tests.filter(
    (test) =>
      test.status === "failed" ||
      test.status === "timedOut" ||
      test.status === "flaky",
  );

  const analyzedFailures = failedTests.map(
    analyzeTestFailure,
  );

  const groupedFailures = new Map<
    string,
    AnalyzedFailure[]
  >();

  for (const failure of analyzedFailures) {
    const groupKey = `${failure.category}:${failure.likelySource}`;
    const existingGroup = groupedFailures.get(groupKey) ?? [];

    existingGroup.push(failure);
    groupedFailures.set(groupKey, existingGroup);
  }

  const categories = [...groupedFailures.values()]
    .map((failures) => ({
      category: failures[0]!.category,
      likelySource: failures[0]!.likelySource,
      count: failures.length,
      failures,
    }))
    .sort(
      (firstGroup, secondGroup) =>
        secondGroup.count - firstGroup.count,
    );

  return {
    totalFailures: analyzedFailures.length,
    affectedTests: failedTests.length,
    categories,
  };
}