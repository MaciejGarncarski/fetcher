import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getErrors } from "./get-error";

export type ReturnTypeSuccess<T> = {
  success: true;
  data: StandardSchemaV1.SuccessResult<T>;
  issues?: never;
};
export type ReturnTypeError = {
  success: false;
  data?: never;
  issues: Record<string, string[]>;
};

export async function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>
): Promise<ReturnTypeSuccess<T> | ReturnTypeError> {
  try {
    let result = schema["~standard"].validate(input);
    if (result instanceof Promise) result = await result;

    if (result.issues) {
      const formattedIssues = await getErrors(result.issues);

      return {
        success: false,
        issues: formattedIssues,
      };
    }

    return {
      success: true,
      data: result.value as StandardSchemaV1.SuccessResult<T>,
    };
  } catch (error) {
    console.error(error);
    return {
      issues: {
        UNKNOWN: ["UNKNOWN ISSUE OCCURED"],
      },
      success: false,
    };
  }
}
