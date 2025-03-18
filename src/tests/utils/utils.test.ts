import { canSendBody, parseUrl } from "../../utils/utils.js";

describe("canSendBody", () => {
  it("should throw an error when no method is provided", () => {
    // @ts-ignore
    expect(() => canSendBody()).toThrowError("No method provided.");
  });

  it("should return false for the GET method", () => {
    const result = canSendBody("GET");
    expect(result).toBe(false);
  });

  it("should return false for the DELETE method", () => {
    const result = canSendBody("DELETE");
    expect(result).toBe(false);
  });

  it("should return true for the POST method", () => {
    const result = canSendBody("POST");
    expect(result).toBe(true);
  });

  it("should return true for the PUT method", () => {
    const result = canSendBody("PUT");
    expect(result).toBe(true);
  });

  it("should return true for the PATCH method", () => {
    const result = canSendBody("PATCH");
    expect(result).toBe(true);
  });
});

describe("parseUrl", () => {
  it("should return the original URL if it starts with 'http'", () => {
    const result = parseUrl("https://facebook.com", "http://mybaseurl");
    expect(result).toBe("https://facebook.com");
  });

  it("should prepend the base API URL to the provided path", () => {
    const result = parseUrl("/test", "http://mybaseurl");
    expect(result).toBe("http://mybaseurl/test");
  });
});
