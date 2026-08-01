export type JUnitAttributeValue =
  | string
  | number
  | boolean;

export interface JUnitIssueNode {
  "@_type"?: JUnitAttributeValue;
  "@_message"?: JUnitAttributeValue;
  "#text"?: JUnitAttributeValue;
}

export interface JUnitSkippedNode {
  "@_message"?: JUnitAttributeValue;
  "#text"?: JUnitAttributeValue;
}

export interface JUnitTestCaseNode {
  "@_name"?: JUnitAttributeValue;
  "@_classname"?: JUnitAttributeValue;
  "@_file"?: JUnitAttributeValue;
  "@_project"?: JUnitAttributeValue;
  "@_time"?: JUnitAttributeValue;
  failure?: JUnitIssueNode | JUnitIssueNode[];
  error?: JUnitIssueNode | JUnitIssueNode[];
  skipped?: JUnitSkippedNode | JUnitSkippedNode[];
}

export interface JUnitTestSuiteNode {
  "@_name"?: JUnitAttributeValue;
  "@_timestamp"?: JUnitAttributeValue;
  "@_time"?: JUnitAttributeValue;
  testcase?: JUnitTestCaseNode | JUnitTestCaseNode[];
  testsuite?: JUnitTestSuiteNode | JUnitTestSuiteNode[];
}

export interface JUnitTestSuitesNode {
  "@_name"?: JUnitAttributeValue;
  "@_time"?: JUnitAttributeValue;
  testsuite?: JUnitTestSuiteNode | JUnitTestSuiteNode[];
}

export interface JUnitReportDocument {
  testsuites?: JUnitTestSuitesNode;
  testsuite?: JUnitTestSuiteNode;
}