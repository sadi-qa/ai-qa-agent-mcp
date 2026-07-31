export interface PlaywrightJsonReport {
  suites: PlaywrightSuite[];
  errors: PlaywrightError[];
  stats: PlaywrightStats;
}

export interface PlaywrightSuite {
  title: string;
  file: string;
  specs: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightSpec {
  title: string;
  ok: boolean;
  tests: PlaywrightTest[];
}

export interface PlaywrightTest {
  projectId: string;
  projectName?: string;
  expectedStatus: string;
  status: string;
  results: PlaywrightTestAttempt[];
}

export interface PlaywrightTestAttempt {
  status: string;
  duration: number;
  retry: number;
  errors: PlaywrightError[];
}

export interface PlaywrightError {
  message: string;
  stack?: string;
}

export interface PlaywrightStats {
  startTime: string;
  duration: number;
  expected: number;
  skipped: number;
  unexpected: number;
  flaky: number;
}