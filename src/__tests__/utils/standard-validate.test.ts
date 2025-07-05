import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { standardValidate } from "../../utils/standard-validate";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// Mock the getErrors function
vi.mock("../../utils/get-error", () => ({
  getErrors: vi.fn(),
}));

import { getErrors } from "../../utils/get-error";

const mockGetErrors = getErrors as any;

describe("standardValidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("success cases", () => {
    it("returns success result for valid input with synchronous validation", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: undefined,
            value: { name: "test", age: 25 },
          }),
        },
      } as any;

      const result = await standardValidate(mockSchema, { name: "test", age: 25 });

      expect(result).toEqual({
        success: true,
        data: { name: "test", age: 25 },
      });
      expect(mockSchema["~standard"].validate).toHaveBeenCalledWith({
        name: "test",
        age: 25,
      });
    });

    it("returns success result for valid input with asynchronous validation", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockResolvedValue({
            issues: undefined,
            value: { email: "test@example.com" },
          }),
        },
      } as any;

      const result = await standardValidate(mockSchema, { email: "test@example.com" });

      expect(result).toEqual({
        success: true,
        data: { email: "test@example.com" },
      });
      expect(mockSchema["~standard"].validate).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });

    it("handles empty validation result", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: undefined,
            value: {},
          }),
        },
      } as any;

      const result = await standardValidate(mockSchema, {});

      expect(result).toEqual({
        success: true,
        data: {},
      });
    });
  });

  describe("validation error cases", () => {
    it("returns error result for validation issues with synchronous validation", async () => {
      const mockIssues = [
        { message: "Name is required", path: ["name"] },
        { message: "Age must be positive", path: ["age"] },
      ];

      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: mockIssues,
            value: undefined,
          }),
        },
      } as any;

      mockGetErrors.mockResolvedValue({
        name: ["Name is required"],
        age: ["Age must be positive"],
      });

      const result = await standardValidate(mockSchema, { age: -5 });

      expect(result).toEqual({
        success: false,
        issues: {
          name: ["Name is required"],
          age: ["Age must be positive"],
        },
      });
      expect(mockGetErrors).toHaveBeenCalledWith(mockIssues);
    });

    it("returns error result for validation issues with asynchronous validation", async () => {
      const mockIssues = [
        { message: "Invalid email format", path: ["email"] },
      ];

      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockResolvedValue({
            issues: mockIssues,
            value: undefined,
          }),
        },
      } as any;

      mockGetErrors.mockResolvedValue({
        email: ["Invalid email format"],
      });

      const result = await standardValidate(mockSchema, { email: "invalid-email" });

      expect(result).toEqual({
        success: false,
        issues: {
          email: ["Invalid email format"],
        },
      });
      expect(mockGetErrors).toHaveBeenCalledWith(mockIssues);
    });

    it("handles empty issues array", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: [],
            value: undefined,
          }),
        },
      } as any;

      mockGetErrors.mockResolvedValue({});

      const result = await standardValidate(mockSchema, {});

      expect(result).toEqual({
        success: false,
        issues: {},
      });
      expect(mockGetErrors).toHaveBeenCalledWith([]);
    });
  });

  describe("error handling", () => {
    it("handles validation function throwing an error", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockImplementation(() => {
            throw new Error("Validation failed");
          }),
        },
      } as any;

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await standardValidate(mockSchema, {});

      expect(result).toEqual({
        success: false,
        issues: {
          UNKNOWN: ["UNKNOWN ISSUE OCCURED"],
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(new Error("Validation failed"));
      expect(mockGetErrors).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("handles validation function returning a rejected promise", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockRejectedValue(new Error("Async validation failed")),
        },
      } as any;

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await standardValidate(mockSchema, {});

      expect(result).toEqual({
        success: false,
        issues: {
          UNKNOWN: ["UNKNOWN ISSUE OCCURED"],
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(new Error("Async validation failed"));
      expect(mockGetErrors).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("handles getErrors function throwing an error", async () => {
      const mockIssues = [
        { message: "Test error", path: ["test"] },
      ];

      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: mockIssues,
            value: undefined,
          }),
        },
      } as any;

      mockGetErrors.mockRejectedValue(new Error("getErrors failed"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await standardValidate(mockSchema, {});

      expect(result).toEqual({
        success: false,
        issues: {
          UNKNOWN: ["UNKNOWN ISSUE OCCURED"],
        },
      });
      expect(consoleSpy).toHaveBeenCalledWith(new Error("getErrors failed"));

      consoleSpy.mockRestore();
    });
  });

  describe("type safety", () => {
    it("maintains type safety for success result", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: undefined,
            value: { id: 1, name: "test" },
          }),
        },
      } as any;

      const result = await standardValidate(mockSchema, { id: 1, name: "test" });

      if (result.success) {
        // TypeScript should know that data exists here
        expect(result.data).toEqual({ id: 1, name: "test" });
        expect(result.issues).toBeUndefined();
      } else {
        // This should not happen in this test case
        expect.fail("Expected success result");
      }
    });

    it("maintains type safety for error result", async () => {
      const mockSchema = {
        "~standard": {
          validate: vi.fn().mockReturnValue({
            issues: [{ message: "Error", path: ["field"] }],
            value: undefined,
          }),
        },
      } as any;

      mockGetErrors.mockResolvedValue({
        field: ["Error"],
      });

      const result = await standardValidate(mockSchema, {});

      if (!result.success) {
        // TypeScript should know that issues exists here
        expect(result.issues).toEqual({ field: ["Error"] });
        expect(result.data).toBeUndefined();
      } else {
        // This should not happen in this test case
        expect.fail("Expected error result");
      }
    });
  });
});
