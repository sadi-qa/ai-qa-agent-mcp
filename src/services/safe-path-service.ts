import { relative, resolve } from "node:path";

export function resolveSafePath(
  allowedRoot: string,
  requestedPath: string,
): string {
  const resolvedRoot = resolve(allowedRoot);
  const resolvedPath = resolve(resolvedRoot, requestedPath);
  const relativePath = relative(resolvedRoot, resolvedPath);

  const isOutsideAllowedRoot =
    relativePath.startsWith("..") ||
    relativePath.includes(`..\\`) ||
    relativePath.includes("../");

  if (isOutsideAllowedRoot) {
    throw new Error(
      "Access denied: requested path is outside the approved directory.",
    );
  }

  return resolvedPath;
}