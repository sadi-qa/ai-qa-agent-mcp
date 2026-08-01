import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseJUnitXmlReport } from "../../src/parsers/junit-xml-parser.js";

describe("parseJUnitXmlReport", () => {
  it("normalizes a JUnit XML report", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "junit",
      "junit-results.xml",
    );

    const testRun =
      await parseJUnitXmlReport(reportPath);

    expect(testRun.runId).toBe(
      "junit-results.xml-2026-07-30T18:30:00.000Z",
    );

    expect(testRun.sourceFile).toBe(reportPath);
    expect(testRun.format).toBe("junit");

    expect(testRun.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(testRun.durationMs).toBe(36850);
    expect(testRun.tests).toHaveLength(4);

    expect(
      testRun.tests.map((test) => test.status),
    ).toEqual([
      "passed",
      "failed",
      "skipped",
      "timedOut",
    ]);
  });

  it("normalizes JUnit test identities and durations", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "junit",
      "junit-results.xml",
    );

    const testRun =
      await parseJUnitXmlReport(reportPath);

    expect(testRun.tests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tests/auth/login.spec.ts::valid user can log in::chromium",
          title: "valid user can log in",
          file: "tests/auth/login.spec.ts",
          project: "chromium",
          status: "passed",
          durationMs: 1250,
          retry: 0,
          errors: [],
        }),
        expect.objectContaining({
          id: "tests/auth/login.spec.ts::locked user sees an error message::chromium",
          status: "failed",
          durationMs: 2180,
        }),
        expect.objectContaining({
          id: "tests/checkout/checkout.spec.ts::guest checkout is skipped::chromium",
          status: "skipped",
          durationMs: 0,
        }),
        expect.objectContaining({
          id: "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
          status: "timedOut",
          durationMs: 33420,
        }),
      ]),
    );
  });

  it("preserves failure and timeout evidence", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "junit",
      "junit-results.xml",
    );

    const testRun =
      await parseJUnitXmlReport(reportPath);

    const failedTest = testRun.tests.find(
      (test) =>
        test.title ===
        "locked user sees an error message",
    );

    const timedOutTest = testRun.tests.find(
      (test) =>
        test.title ===
        "customer completes checkout",
    );

    expect(failedTest?.errors).toEqual([
      {
        message:
          'Expected error message to contain "locked out", but received "Invalid credentials".',
        stack:
          "Error: expect(locator).toContainText failed at tests/auth/login.spec.ts:42:31",
      },
    ]);

    expect(timedOutTest?.errors).toEqual([
      {
        message:
          "Test timeout of 30000ms exceeded while waiting for checkout confirmation.",
        stack:
          "TimeoutError: locator.waitFor at tests/checkout/checkout.spec.ts:68:25",
      },
    ]);
  });
});