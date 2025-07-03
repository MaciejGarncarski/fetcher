/* v8 ignore next */
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ResponseType = "json" | "text" | "arrayBuffer";
export type HTTPMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
export type Body = FormData | Record<string, unknown>;

export type FetcherOptions<
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends StandardSchemaV1 | undefined = undefined
> =
  | {
      responseType?: TResponseType;
      method: TMethod;
      url: string;
      body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
      schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
      throwOnError?: boolean;
      signal?: AbortSignal;
      onErrorThrown?: (err: unknown) => void;
      headers: Record<string, string>;
      headerMergeStrategy?: "merge" | "overwrite";
    }
  | {
      responseType?: TResponseType;
      method: TMethod;
      url: string;
      body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
      schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
      throwOnError?: boolean;
      signal?: AbortSignal;
      onErrorThrown?: (err: unknown) => void;
      headers?: undefined;
      headerMergeStrategy?: never;
    };

export type FetcherInstanceOptions<T extends unknown> = {
  onErrorThrown?: (err: T) => void;
  baseURL?: string;
  throwOnError?: boolean;
  headers?: Record<string, string>;
};

export type FetcherFunction = <
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends StandardSchemaV1 | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>
) => Promise<FetcherReturn<TResponseType, TSchema>>;

export type FetcherReturn<
  TResponseType extends ResponseType | undefined,
  TSchema extends StandardSchemaV1 | undefined
> = null | {
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
  isError?: boolean;
  errorMessage?: string;
};

export type TransformedData<TResponseType extends ResponseType> =
  TResponseType extends "json"
    ? Record<string, string>
    : TResponseType extends "text"
    ? string
    : TResponseType extends "arrayBuffer"
    ? ArrayBuffer
    : Record<string, string>;
