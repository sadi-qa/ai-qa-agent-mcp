# AI QA Agent MCP

[![QA Validation](https://github.com/sadi-qa/ai-qa-agent-mcp/actions/workflows/qa-validation.yml/badge.svg)](https://github.com/sadi-qa/ai-qa-agent-mcp/actions/workflows/qa-validation.yml)

A TypeScript-based Model Context Protocol server that analyzes Playwright JSON and JUnit XML test results and provides structured QA insights to AI clients.

## Project Goal

This project demonstrates how an AI client can use MCP tools, resources, and prompts to:

- Discover supported test-result files
- Normalize Playwright JSON and JUnit XML reports
- Calculate test-execution metrics
- Analyze failed, timed-out, and flaky tests
- Group failures by probable category
- Generate structured draft bug reports
- Generate Markdown QA execution summaries
- Provide advisory release-quality recommendations

## Implemented MCP Capabilities

### Tools

- `list_test_runs`
- `get_test_run_summary`
- `analyze_test_failures`
- `generate_bug_report`
- `generate_qa_summary`

### Resource

- `test-run://latest`

The resource returns the newest supported report as normalized QA execution data.

### Prompt

- `prepare_release_quality_report`

The prompt guides an AI client through a structured release-quality analysis workflow using the available MCP tools.

## Supported Report Formats

- Playwright JSON
- JUnit XML

Both formats are converted into one normalized internal test-result model before analysis.

## Technology Stack

- Node.js
- TypeScript
- Model Context Protocol TypeScript SDK
- Zod
- Fast XML Parser
- Vitest
- Playwright JSON
- JUnit XML
- MCP Inspector
- Codex CLI
- GitHub Actions

## Architecture

```text
Playwright JSON Reports     JUnit XML Reports
          |                         |
          +------------+------------+
                       |
                       v
                 Report Parsers
                       |
                       v
             Normalized Test Results
                       |
                       v
               QA Analysis Services
                       |
                       v
                   MCP Server
              |         |         |
            Tools    Resources   Prompts
              |         |         |
              +---------+---------+
                       |
                       v
             MCP Inspector or AI Client
```

## Project Structure

```text
ai-qa-agent-mcp/
├── .github/
│   └── workflows/
│       └── qa-validation.yml
├── docs/
├── reports/
├── sample-data/
│   ├── json/
│   │   └── playwright-results.json
│   └── junit/
│       └── junit-results.xml
├── src/
│   ├── config/
│   ├── parsers/
│   ├── prompts/
│   ├── resources/
│   ├── services/
│   ├── tools/
│   ├── types/
│   ├── mcp-server.ts
│   └── server.ts
├── tests/
│   ├── integration/
│   │   └── mcp-server.integration.test.ts
│   └── unit/
├── .gitignore
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

## Development Commands

Install dependencies:

```bash
npm install
```

Run the server during development:

```bash
npm run dev
```

Check TypeScript:

```bash
npm run typecheck
```

Run automated tests:

```bash
npm test
```

Generate the production build:

```bash
npm run build
```

Run type checking, automated tests, and the production build:

```bash
npm run check
```

## MCP Integration Testing

The integration suite creates an MCP server and client connected through the SDK's in-memory transport.

It verifies that an MCP client can:

- Discover all five registered tools
- Call the JUnit test-run summary tool
- Discover and read `test-run://latest`
- Discover and retrieve `prepare_release_quality_report`
- Exchange normalized QA data through the MCP protocol

The reusable MCP server is created by:

```text
src/mcp-server.ts
```

The production stdio entry point remains:

```text
src/server.ts
```

## Continuous Integration

The `QA Validation` GitHub Actions workflow runs for:

- Pull requests targeting `main`
- Pushes to `main`
- Manual workflow executions

The workflow uses Node.js 24 and runs:

```bash
npm ci
npm run check
```

## Example Report Paths

Paths must be relative to the configured approved reports directory.

```text
json/playwright-results.json
junit/junit-results.xml
```

## Security Principles

- Read-only report access by default
- Restricted file-system access
- Safe path resolution
- Maximum report-size enforcement
- Input validation for MCP tools
- No automatic issue creation
- No secret values in logs
- Human review required for AI-generated conclusions
- Release recommendations are advisory only

## Quality Validation

The project currently includes automated coverage for:

- Playwright JSON parsing
- JUnit XML parsing
- Shared report-format routing
- Test-run file discovery
- Test-execution metric calculation
- Failure analysis
- Draft bug-report generation
- QA-summary generation
- Latest-test-run resource handling
- Safe file-path validation
- MCP tool discovery and invocation
- MCP resource discovery and reading
- MCP prompt discovery and retrieval

Current validation result:

```text
17 test files passed
53 tests passed
Production build passed
```

## Current Status

Version `0.1.0` is under active development.

Implemented features include five MCP tools, one MCP resource, one MCP prompt, Playwright JSON support, JUnit XML support, unit and integration test coverage, and GitHub Actions CI validation.