# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.1.0] - 2026-08-02

### Added

- TypeScript-based Model Context Protocol server for analyzing automated test results.
- Playwright JSON report parsing and normalization.
- JUnit XML report parsing and normalization.
- Shared report parser supporting Playwright JSON and JUnit XML.
- `list_test_runs` MCP tool for discovering supported reports.
- `get_test_run_summary` MCP tool for calculating execution metrics.
- `analyze_test_failures` MCP tool for grouping failed, timed-out, and flaky tests.
- `generate_bug_report` MCP tool for creating structured draft bug reports.
- `generate_qa_summary` MCP tool for producing Markdown QA summaries and advisory release recommendations.
- `test-run://latest` MCP resource for retrieving the newest supported test run.
- `prepare_release_quality_report` MCP prompt for structured release-quality analysis.
- Failure categorization and likely-source suggestions.
- Pass-rate, failure-rate, skip-rate, duration, timeout, and flaky-test metrics.
- Safe-path validation and approved-directory restrictions.
- Maximum report-size enforcement.
- Sample Playwright JSON and JUnit XML reports.
- Reusable MCP server factory for testing and production use.
- MCP protocol-level integration tests using the SDK in-memory transport.
- GitHub Actions `QA Validation` workflow using Node.js 24.
- Cross-platform test-path handling for Windows and Linux.
- V8 code-coverage reporting.
- Global code-coverage thresholds:
  - Statements: 80%
  - Branches: 65%
  - Functions: 90%
  - Lines: 80%
- QA Validation status badge in the README.
- Development, security, architecture, testing, CI, and coverage documentation.

### Fixed

- Corrected QA-summary grammar.
- Corrected report-path assertions to work across operating systems.
- Corrected MCP input descriptions and documentation spacing issues.

### Security

- Report access is read-only by default.
- File access is restricted to the configured reports directory.
- Paths are validated to prevent directory traversal.
- Report size is checked before parsing.
- Generated bug reports and release recommendations require human QA review.

### Validation

- 17 test files passing.
- 53 automated tests passing.
- MCP tool, resource, and prompt integration tests passing.
- Coverage thresholds passing.
- TypeScript validation passing.
- Production build passing.