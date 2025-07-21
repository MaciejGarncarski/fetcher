/* v8 ignore next */
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ResponseType = "json" | "text" | "arrayBuffer";
export type HTTPMethod =
  | "GET"
  | "POST"
  | "DELETE"
  | "PUT"
  | "PATCH"
  | (string & {});

export type Body =
  | Record<string, unknown>
  | ArrayBuffer
  | Blob
  | FormData
  | URLSearchParams
  | string;

export type FetcherOptions<
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends StandardSchemaV1 | undefined = undefined
> =
  | {
      integrity?: RequestInit["integrity"];
      referrerPolicy?: ReferrerPolicy;
      referrer?: RequestInit["referrer"];
      redirect?: RequestRedirect;
      priority?: RequestPriority;
      mode?: RequestInit["mode"];
      keepalive?: RequestInit["keepalive"];
      credentials?: RequestCredentials;
      cache?: RequestCache;
      responseType?: TResponseType;
      method: TMethod;
      url: string;
      body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
      schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
      throwOnError?: boolean;
      signal?: AbortSignal;
      onErrorThrown?: (err: unknown) => void;
      headers: Record<string, string>;
      headersStrategy?: "merge" | "overwrite" | "omit-global";
    }
  | {
      integrity?: RequestInit["integrity"];
      referrerPolicy?: ReferrerPolicy;
      referrer?: RequestInit["referrer"];
      redirect?: RequestRedirect;
      priority?: RequestPriority;
      mode?: RequestInit["mode"];
      keepalive?: RequestInit["keepalive"];
      credentials?: RequestCredentials;
      cache?: RequestCache;
      responseType?: TResponseType;
      method: TMethod;
      url: string;
      body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
      schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
      throwOnError?: boolean;
      signal?: AbortSignal;
      onErrorThrown?: (err: unknown) => void;
      headers?: undefined;
      headersStrategy?: never;
    };

export type FetcherInstanceOptions<T = unknown> = {
  onErrorThrown?: (err: T) => void;
  baseURL?: string;
  throwOnError?: boolean;
  headers?: Record<string, string>;
};

export type FetcherReturn<
  TResponseType extends ResponseType | undefined,
  TSchema extends StandardSchemaV1 | undefined
> =
  | {
      statusCode: number;
      headers: Record<string, string>;
      data: TResponseType extends undefined
        ? TSchema extends undefined
          ? Record<string, unknown>
          : TSchema extends StandardSchemaV1
          ? StandardSchemaV1.InferOutput<TSchema>
          : Record<string, unknown>
        : TSchema extends undefined
        ? TResponseType extends "json"
          ? Record<string, unknown>
          : TResponseType extends "text"
          ? string
          : TResponseType extends "arrayBuffer"
          ? ArrayBuffer
          : Record<string, unknown>
        : TSchema extends StandardSchemaV1
        ? TResponseType extends "json"
          ? StandardSchemaV1.InferOutput<TSchema>
          : TResponseType extends "text"
          ? StandardSchemaV1.InferOutput<TSchema>
          : TResponseType extends "arrayBuffer"
          ? ArrayBuffer
          : StandardSchemaV1.InferOutput<TSchema>
        : TResponseType extends "json"
        ? Record<string, unknown>
        : TResponseType extends "text"
        ? string
        : TResponseType extends "arrayBuffer"
        ? ArrayBuffer
        : Record<string, unknown>;
      isError: false;
      errorMessage?: never;
    }
  | {
      statusCode: number;
      headers: Record<string, string>;
      data: TResponseType extends undefined
        ? TSchema extends undefined
          ? Record<string, unknown>
          : TSchema extends StandardSchemaV1
          ? StandardSchemaV1.InferOutput<TSchema>
          : Record<string, unknown>
        : TSchema extends undefined
        ? TResponseType extends "json"
          ? Record<string, unknown>
          : TResponseType extends "text"
          ? string
          : TResponseType extends "arrayBuffer"
          ? ArrayBuffer
          : Record<string, unknown>
        : TSchema extends StandardSchemaV1
        ? TResponseType extends "json"
          ? StandardSchemaV1.InferOutput<TSchema>
          : TResponseType extends "text"
          ? StandardSchemaV1.InferOutput<TSchema>
          : TResponseType extends "arrayBuffer"
          ? ArrayBuffer
          : StandardSchemaV1.InferOutput<TSchema>
        : TResponseType extends "json"
        ? Record<string, unknown>
        : TResponseType extends "text"
        ? string
        : TResponseType extends "arrayBuffer"
        ? ArrayBuffer
        : Record<string, unknown>;
      isError: true;
      errorMessage: string;
    };

export type TransformedData<TResponseType extends ResponseType> =
  TResponseType extends "json"
    ? Record<string, unknown>
    : TResponseType extends "text"
    ? string
    : TResponseType extends "arrayBuffer"
    ? ArrayBuffer
    : Record<string, unknown>;
