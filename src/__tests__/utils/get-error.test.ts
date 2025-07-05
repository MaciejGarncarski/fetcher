import { describe, it, expect } from "vitest";
import { getDotPath, getErrors } from "../../utils/get-error";

type Issue = {
  message: string;
  path?: (string | number | { key: string | number })[];
};

describe("getDotPath", () => {
  it("returns dot path for string path", () => {
    const issue: Issue = { message: "err", path: ["foo", "bar"] };
    expect(getDotPath(issue as any)).toBe("foo.bar");
  });

  it("returns dot path for number path", () => {
    const issue: Issue = { message: "err", path: ["foo", 0, "bar"] };
    expect(getDotPath(issue as any)).toBe("foo.0.bar");
  });

  it("returns dot path for object path segments", () => {
    const issue: Issue = { message: "err", path: ["foo", { key: "bar" }, { key: 1 }] };
    expect(getDotPath(issue as any)).toBe("foo.bar.1");
  });

  it("returns null for invalid path segment", () => {
    const issue: Issue = { message: "err", path: ["foo", { key: {} as any }] };
    expect(getDotPath(issue as any)).toBeNull();
  });

  it("returns null for missing path", () => {
    const issue: Issue = { message: "err" };
    expect(getDotPath(issue as any)).toBeNull();
  });

  it("returns null for empty path", () => {
    const issue: Issue = { message: "err", path: [] };
    expect(getDotPath(issue as any)).toBeNull();
  });
});

describe("getErrors", () => {
  it("returns empty object for undefined input", async () => {
    expect(await getErrors(undefined)).toEqual({});
  });

  it("returns empty object for empty array", async () => {
    expect(await getErrors([])).toEqual({});
  });

  it("groups messages by dot path", async () => {
    const issues: Issue[] = [
      { message: "err1", path: ["foo"] },
      { message: "err2", path: ["foo"] },
      { message: "err3", path: ["bar"] },
    ];
    expect(await getErrors(issues as any)).toEqual({
      foo: ["err1", "err2"],
      bar: ["err3"],
    });
  });

  it("ignores issues with invalid path", async () => {
    const issues: Issue[] = [
      { message: "err1", path: ["foo"] },
      { message: "err2", path: [{ key: {} as any }] },
      { message: "err3" },
    ];
    expect(await getErrors(issues as any)).toEqual({
      foo: ["err1"],
    });
  });
});
