import { z } from "zod";
import { createFetcherInstance } from "../../lib/fetcher.js";
import {
  bufferMock,
  postMockSchema,
  postsMock,
  setupHTTPMocks,
} from "../__mocks__/http.js";
import { ApiError } from "../../lib/api-error.js";

setupHTTPMocks();

const fetcher = createFetcherInstance({
  baseURL: "https://dummy.endpoint",
});

const fetcherWithApiError = createFetcherInstance({
  baseURL: "https://dummy.endpoint",
  apiErrorSchema: z.object({
    message: z.string(),
    toastMessage: z.optional(z.string()),
    statusCode: z.number(),
  }),
});

describe("fetcher", () => {
  describe("responseType", () => {
    describe("invalid responseType", () => {
      it("should return data when invalid responseType passed and actual response is JSON", async () => {
        const response = await fetcher({
          method: "GET",
          // @ts-ignore
          responseType: "imagined",
          url: "/json",
        });

        expect(response).toEqual(postsMock);
      });

      it("should return null when invalid responseType passed and actual response is ArrayBuffer", async () => {
        const response = await fetcher({
          method: "GET",
          // @ts-ignore
          responseType: "imagined",
          url: "/array-buffer",
        });

        expect(response).toEqual(null);
      });

      it("should return empty string when invalid responseType passed and actual response is text", async () => {
        const response = await fetcher({
          method: "GET",
          // @ts-ignore
          responseType: "imagined",
          url: "/text",
        });

        expect(response).toEqual(null);
      });
    });

    describe("default", () => {
      it("should return corret data object when no responseType passed and actual response is JSON", async () => {
        const response = await fetcher({
          method: "GET",
          url: "/json",
        });

        expect(response).toEqual(postsMock);
      });

      it("should return null when no responseType passed and actual response is ArrayBuffer", async () => {
        const response = await fetcher({
          method: "GET",
          url: "/array-buffer",
        });

        expect(response).toEqual(null);
      });

      it("should return empty string when no responseType passed and actual response is text", async () => {
        const response = await fetcher({
          method: "GET",
          url: "/text",
        });

        expect(response).toEqual(null);
      });
    });

    describe("text", () => {
      it("should return stringified data when responseType is 'text' and actual response is JSON", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "text",
          url: "/json",
        });

        expect(response).toEqual(JSON.stringify(postsMock));
      });

      it("should return empty string when responseType is 'text' and actual response is ArrayBuffer", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "text",
          url: "/array-buffer",
        });

        expect(response).toEqual("");
      });

      it("should return correct text when responseType is 'text' and actual response is text", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "text",
          url: "/text",
        });

        expect(response).toEqual("mock-text");
      });
    });

    describe("json", () => {
      it("should return corret data object when responseType is 'json' and actual response is JSON", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "json",
          url: "/json",
        });

        expect(response).toEqual(postsMock);
      });

      it("should return null when responseType is 'json' and actual response is ArrayBuffer", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "json",
          url: "/array-buffer",
        });

        expect(response).toEqual(null);
      });

      it("should return empty string when responseType is 'json' and actual response is text", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "json",
          url: "/text",
        });

        expect(response).toEqual(null);
      });
    });

    describe("arrayBuffer", () => {
      it("should return arrayBuffer data when responseType is 'arrayBuffer' and actual response is JSON", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "arrayBuffer",
          url: "/json",
        });

        expect(response).toBeInstanceOf(ArrayBuffer);
      });

      it("should return correct arrayBuffer data when responseType is 'arrayBuffer' and actual response is ArrayBuffer", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "arrayBuffer",
          url: "/array-buffer",
        });

        expect(response).toEqual(bufferMock);
      });

      it("should return arrayBuffer data when responseType is 'arrayBuffer' and actual response is text", async () => {
        const response = await fetcher({
          method: "GET",
          responseType: "arrayBuffer",
          url: "/text",
        });

        expect(response).toBeInstanceOf(ArrayBuffer);
      });
    });
  });

  describe("response error handling", () => {
    it("should throw error", async () => {
      expect(true).toBe(true);

      await expect(
        fetcher({ method: "GET", url: "/error", throwOnError: true })
      ).rejects.toThrowError();
    });

    it("should throw ApiError with correct message when API error schema validation fails", async () => {
      try {
        await fetcherWithApiError({
          method: "GET",
          url: "/error-invalid-schema",
          throwOnError: true,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.message).toEqual("error parsing failed");
        }

        expect(error).toBeInstanceOf(ApiError);
      }
    });

    it("should throw ApiError with toast message if has one", async () => {
      try {
        await fetcherWithApiError({
          method: "GET",
          url: "/error-valid-schema-toast",
          throwOnError: true,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.toastMessage).toEqual("Bar");
        }

        expect(error).toBeInstanceOf(ApiError);
      }
    });

    it("should throw ApiError with message if has one", async () => {
      try {
        await fetcherWithApiError({
          method: "GET",
          url: "/error-valid-schema",
          throwOnError: true,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          expect(error.message).toEqual("Foo");
        }

        expect(error).toBeInstanceOf(ApiError);
      }
    });
  });

  describe("data schema validation", () => {
    it("should not throw when response data conforms to the schema", async () => {
      await expect(
        fetcher({
          method: "GET",
          url: "/json",
          throwOnError: true,
          schema: postMockSchema,
        })
      ).resolves.not.toThrow();
    });

    it("should throw when response data does not conform to the schema", async () => {
      await expect(
        fetcher({
          method: "GET",
          throwOnError: true,
          url: "/json",
          schema: z.object({}),
        })
      ).rejects.toThrow();
    });
  });
});
