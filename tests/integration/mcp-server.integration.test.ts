import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { createAiQaAgentMcpServer } from "../../src/mcp-server.js";

function getTextContent(
  content: unknown,
): string {
  if (!Array.isArray(content)) {
    throw new Error(
      "Expected the MCP response content to be an array.",
    );
  }

  const textContent = content.find(
    (item): item is {
      type: "text";
      text: string;
    } =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      item.type === "text" &&
      "text" in item &&
      typeof item.text === "string",
  );

  if (!textContent) {
    throw new Error(
      "Expected the MCP response to contain text content.",
    );
  }

  return textContent.text;
}

describe("AI QA Agent MCP server integration", () => {
  const server = createAiQaAgentMcpServer();

  const client = new Client({
    name: "ai-qa-agent-mcp-integration-client",
    version: "1.0.0",
  });

  beforeAll(async () => {
    const [
      clientTransport,
      serverTransport,
    ] = InMemoryTransport.createLinkedPair();

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  it("exposes all registered MCP tools", async () => {
    const result = await client.listTools();

    const toolNames = result.tools.map(
      (tool) => tool.name,
    );

    expect(toolNames).toEqual(
      expect.arrayContaining([
        "list_test_runs",
        "get_test_run_summary",
        "analyze_test_failures",
        "generate_bug_report",
        "generate_qa_summary",
      ]),
    );

    expect(result.tools).toHaveLength(5);
  });

  it("calls the JUnit test-run summary tool through MCP", async () => {
    const result = await client.callTool({
      name: "get_test_run_summary",
      arguments: {
        reportPath: "junit/junit-results.xml",
      },
    });

    expect(result.isError).not.toBe(true);

    const responseText = getTextContent(
      result.content,
    );

    const responseData = JSON.parse(
      responseText,
    ) as {
      format: string;
      summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        timedOutTests: number;
        skippedTests: number;
      };
    };

    expect(responseData.format).toBe("junit");

    expect(responseData.summary).toMatchObject({
      totalTests: 4,
      passedTests: 1,
      failedTests: 1,
      timedOutTests: 1,
      skippedTests: 1,
    });
  });

  it("exposes and reads the latest-test-run resource", async () => {
    const listedResources =
      await client.listResources();

    expect(listedResources.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: "test-run://latest",
          name: "latest_test_run",
        }),
      ]),
    );

    const resourceResult =
      await client.readResource({
        uri: "test-run://latest",
      });

    const resourceContent =
      resourceResult.contents[0];

    if (
      !resourceContent ||
      !("text" in resourceContent)
    ) {
      throw new Error(
        "Expected the MCP resource to contain JSON text.",
      );
    }

    const resourceData = JSON.parse(
      resourceContent.text,
    ) as {
      format: string;
      tests: unknown[];
    };

    expect([
      "playwright-json",
      "junit",
    ]).toContain(resourceData.format);

    expect(resourceData.tests).toHaveLength(4);
  });

  it("exposes and retrieves the release-quality prompt", async () => {
    const listedPrompts =
      await client.listPrompts();

    expect(listedPrompts.prompts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "prepare_release_quality_report",
        }),
      ]),
    );

    const promptResult = await client.getPrompt({
      name: "prepare_release_quality_report",
      arguments: {
        reportPath:
          "junit/junit-results.xml",
      },
    });

    expect(
      promptResult.messages.length,
    ).toBeGreaterThan(0);

    const firstMessage =
      promptResult.messages[0];

    expect(firstMessage?.role).toBe("user");

    expect(firstMessage?.content).toMatchObject({
      type: "text",
    });

    if (
      !firstMessage ||
      firstMessage.content.type !== "text"
    ) {
      throw new Error(
        "Expected the prompt to contain text content.",
      );
    }

    expect(firstMessage.content.text).toContain(
      "junit/junit-results.xml",
    );
  });
});