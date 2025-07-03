import type { StandardSchemaV1 } from "@standard-schema/spec";

export function getDotPath(issue: StandardSchemaV1.Issue): string | null {
  if (issue.path?.length) {
    let dotPath = "";
    for (const item of issue.path) {
      const key = typeof item === "object" ? item.key : item;
      if (typeof key === "string" || typeof key === "number") {
        if (dotPath) {
          dotPath += `.${key}`;
        } else {
          dotPath += key;
        }
      } else {
        return null;
      }
    }
    return dotPath;
  }
  return null;
}

export async function getErrors(issues?: readonly StandardSchemaV1.Issue[]) {
  const fieldErrors: Record<string, string[]> = {};
  if (issues) {
    for (const issue of issues) {
      const dotPath = getDotPath(issue);
      if (dotPath) {
        if (fieldErrors[dotPath]) {
          fieldErrors[dotPath].push(issue.message);
        } else {
          fieldErrors[dotPath] = [issue.message];
        }
      }
    }
  }
  return fieldErrors;
}
