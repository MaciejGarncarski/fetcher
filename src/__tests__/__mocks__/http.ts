import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { z } from "zod";

export const postMockSchema = z.array(
  z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    body: z.string(),
  })
);

export const postsMock = [
  {
    userId: 1,
    id: 1,
    title: "first post title",
    body: "first post body",
  },
];

export const bufferMock = new ArrayBuffer();

const BASE_URL = "https://dummy.endpoint";

export const restHandlers = [
  http.get(`${BASE_URL}/json`, () => {
    return HttpResponse.json(postsMock);
  }),
  http.get(`${BASE_URL}/array-buffer`, () => {
    return HttpResponse.arrayBuffer(bufferMock);
  }),
  http.get(`${BASE_URL}/text`, () => {
    return HttpResponse.text("mock-text");
  }),

  http.get(`${BASE_URL}/error`, () => {
    return HttpResponse.json({ error: "foo" }, { status: 500 });
  }),

  http.get(`${BASE_URL}/error-valid-schema`, () => {
    return HttpResponse.json(
      {
        message: "Foo",
        statusCode: 500,
      },
      { status: 500 }
    );
  }),

  http.get(`${BASE_URL}/error-valid-schema-toast`, () => {
    return HttpResponse.json(
      {
        message: "Foo",
        statusCode: 500,
        toastMessage: "Bar",
      },
      { status: 500 }
    );
  }),

  http.get(`${BASE_URL}/error-invalid-schema`, () => {
    return HttpResponse.json(
      {
        message: "Foo",
      },
      { status: 500 }
    );
  }),
];

const server = setupServer(...restHandlers);

export const setupHTTPMocks = () => {
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  // Close server after all tests
  afterAll(() => server.close());

  // Reset handlers after each test for test isolation
  afterEach(() => server.resetHandlers());
};
