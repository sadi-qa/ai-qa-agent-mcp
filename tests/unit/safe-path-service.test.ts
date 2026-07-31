import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveSafePath } from "../../src/services/safe-path-service.js";

describe("resolveSafePath", () => {
  it("allows a file inside the approved directory", () => {
    const allowedRoot = resolve(
      process.cwd(),
      "sample-data",
    );

    const result = resolveSafePath(
      allowedRoot,
      "json/playwright-results.json",
    );

    expect(result).toBe(
      resolve(
        allowedRoot,
        "json/playwright-results.json",
      ),
    );
  });

  it("allows the approved directory itself", () => {
    const allowedRoot = resolve(
      process.cwd(),
      "sample-data",
    );

    const result = resolveSafePath(
      allowedRoot,
      ".",
    );

    expect(result).toBe(allowedRoot);
  });

  it("rejects access outside the approved directory", () => {
    const allowedRoot = resolve(
      process.cwd(),
      "sample-data",
    );

    expect(() =>
      resolveSafePath(
        allowedRoot,
        "../package.json",
      ),
    ).toThrow(
      "Access denied: requested path is outside the approved directory.",
    );
  });
});