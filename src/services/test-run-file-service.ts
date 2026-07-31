import { readdir, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

export interface TestRunFile {
  fileName: string;
  filePath: string;
  format: "playwright-json" | "junit";
  modifiedAt: string;
  sizeBytes: number;
}

function identifyFormat(
  fileName: string,
): TestRunFile["format"] | null {
  const extension = extname(fileName).toLowerCase();

  if (extension === ".json") {
    return "playwright-json";
  }

  if (extension === ".xml") {
    return "junit";
  }

  return null;
}

async function findFilesInDirectory(
  directoryPath: string,
): Promise<TestRunFile[]> {
  const entries = await readdir(directoryPath, {
    withFileTypes: true,
  });

  const testRunFiles: TestRunFile[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await findFilesInDirectory(entryPath);
      testRunFiles.push(...nestedFiles);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const format = identifyFormat(entry.name);

    if (!format) {
      continue;
    }

    const fileStats = await stat(entryPath);

    testRunFiles.push({
      fileName: entry.name,
      filePath: entryPath,
      format,
      modifiedAt: fileStats.mtime.toISOString(),
      sizeBytes: fileStats.size,
    });
  }

  return testRunFiles;
}

export async function listTestRunFiles(
  rootDirectory: string,
): Promise<TestRunFile[]> {
  const files = await findFilesInDirectory(
    resolve(rootDirectory),
  );

  return files.sort(
    (firstFile, secondFile) =>
      new Date(secondFile.modifiedAt).getTime() -
      new Date(firstFile.modifiedAt).getTime(),
  );
}