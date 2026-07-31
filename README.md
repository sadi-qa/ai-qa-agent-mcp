# AI QA Agent MCP

A TypeScript-based Model Context Protocol server that analyzes Playwright test results and provides structured QA insights.

## Project Goal

This project demonstrates how an AI agent can use MCP tools to:

- Discover Playwright test-result files
- Calculate test execution metrics
- Analyze failed and flaky tests
- Group similar failures
- Generate QA execution summaries
- Create draft bug reports
- Provide release-quality recommendations

## Planned MCP Capabilities

### Tools

- `list_test_runs`
- `get_test_run_summary`
- `analyze_test_failures`
- `generate_bug_report`
- `generate_qa_summary`

### Resource

- `test-run://latest`

### Prompt

- `prepare-release-quality-report`

## Technology Stack

- Node.js
- TypeScript
- Model Context Protocol TypeScript SDK
- Zod
- Vitest
- Playwright JSON and JUnit reports
- GitHub Actions
- MCP Inspector
- Codex CLI

## Planned Architecture

```text
Playwright Test Results
          |
          v
Report Parsers
          |
          v
QA Analysis Services
          |
          v
MCP Server
    |       |       |
  Tools  Resources  Prompts
          |
          v
MCP Inspector or AI Client
```

## Project Structure

```text
ai-qa-agent-mcp/
├── .github/
│   └── workflows/
├── docs/
├── reports/
├── sample-data/
│   ├── json/
│   └── junit/
├── src/
│   ├── config/
│   ├── parsers/
│   ├── prompts/
│   ├── resources/
│   ├── schemas/
│   ├── services/
│   ├── tools/
│   ├── types/
│   └── server.ts
├── tests/
│   ├── integration/
│   └── unit/
├── .gitignore
├── package.json
├── README.md
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

Build the project:

```bash
npm run build
```

Run all validations:

```bash
npm run check
```

## Security Principles

- Read-only report access by default
- Restricted file-system access
- Input validation for every MCP tool
- No automatic issue creation
- No secret values in logs
- Human review required for AI-generated conclusions

## Current Status

Version `0.1.0` is under development.