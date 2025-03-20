import {
  checkCanSendBody,
  getHeaders,
  getBody,
  parseUrl,
  transformBody,
} from "../../utils/utils.js";

describe("checkCanSendBody", () => {
  it("should throw an error when no method is provided", () => {
    // @ts-ignore
    expect(() => checkCanSendBody()).toThrowError("No method provided.");
  });

  it("should return false for the GET method", () => {
    const result = checkCanSendBody("GET");
    expect(result).toBe(false);
  });

  it("should return false for the DELETE method", () => {
    const result = checkCanSendBody("DELETE");
    expect(result).toBe(false);
  });

  it("should return true for the POST method", () => {
    const result = checkCanSendBody("POST");
    expect(result).toBe(true);
  });

  it("should return true for the PUT method", () => {
    const result = checkCanSendBody("PUT");
    expect(result).toBe(true);
  });

  it("should return true for the PATCH method", () => {
    const result = checkCanSendBody("PATCH");
    expect(result).toBe(true);
  });
});

describe("parseUrl", () => {
  it("should return the original URL if it starts with 'http'", () => {
    const result = parseUrl("https://facebook.com", "http://localhost:3001");
    expect(result).toBe("https://facebook.com");
  });

  it("should prepend the base API URL to the provided path", () => {
    const result = parseUrl("/test", "http://localhost:3001");
    expect(result).toBe("http://localhost:3001/test");
  });
});

describe("getHeaders", () => {
  it('should contain "Content-Type": "application/json" when passed object in body', () => {
    const headers = getHeaders({});

    expect(headers.get("Content-Type")).toEqual("application/json");
  });

  it("should return passed headers", () => {
    const headers = getHeaders(null, {
      "X-Test-Header": "foo",
    });

    expect(headers.get("X-Test-Header")).toEqual("foo");
  });
});

describe("getBody", () => {
  it("should return null when no method passed", () => {
    const body = getBody({});
    expect(body).toBe(null);
  });

  it("should return the original body for POST requests", () => {
    const body = { key: "value" };
    const transformedBody = getBody(body, "POST");
    expect(transformedBody).toEqual(body);
  });

  it("should return the original body for PUT requests", () => {
    const body = { key: "value" };
    const transformedBody = getBody(body, "PUT");
    expect(transformedBody).toEqual(body);
  });

  it("should return the original body for PATCH requests", () => {
    const body = { key: "value" };
    const transformedBody = getBody(body, "PATCH");
    expect(transformedBody).toEqual(body);
  });

  it("should return null for GET requests", () => {
    const body = { key: "value" };
    const transformedBody = getBody(body, "GET");
    expect(transformedBody).toBe(null);
  });

  it("should return null for DELETE requests", () => {
    const body = { key: "value" };
    const transformedBody = getBody(body, "DELETE");
    expect(transformedBody).toBe(null);
  });
});

describe("transformBody", () => {
  it("should return undefined for GET requests", () => {
    const body = { key: "value" };
    expect(transformBody(body, "GET")).toBeUndefined();
  });

  it("should return undefined for DELETE requests", () => {
    const body = { key: "value" };
    expect(transformBody(body, "DELETE")).toBeUndefined();
  });

  it("should return a FormData object as is for POST requests", () => {
    const formData = new FormData();
    formData.append("key", "value");
    expect(transformBody(formData, "POST")).toBe(formData);
  });

  it("should return a FormData object as is for PUT requests", () => {
    const formData = new FormData();
    formData.append("key", "value");
    expect(transformBody(formData, "PUT")).toBe(formData);
  });

  it("should return a FormData object as is for PATCH requests", () => {
    const formData = new FormData();
    formData.append("key", "value");
    expect(transformBody(formData, "PATCH")).toBe(formData);
  });

  it("should return a JSON string for a regular object in POST requests", () => {
    const body = { key: "value" };
    expect(transformBody(body, "POST")).toBe(JSON.stringify(body));
  });

  it("should return a JSON string for a regular object in PUT requests", () => {
    const body = { key: "value" };
    expect(transformBody(body, "PUT")).toBe(JSON.stringify(body));
  });

  it("should return a JSON string for a regular object in PATCH requests", () => {
    const body = { key: "value" };
    expect(transformBody(body, "PATCH")).toBe(JSON.stringify(body));
  });

  it("should return undefined when body is null", () => {
    expect(transformBody(null, "POST")).toEqual("null");
  });

  it("should return undefined when body is undefined", () => {
    expect(transformBody(undefined, "POST")).toBeUndefined();
  });

  it("should use GET as default method and return undefined", () => {
    const body = { key: "value" };
    expect(transformBody(body)).toBeUndefined();
  });
});
