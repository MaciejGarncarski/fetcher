/* v8 ignore next */
import { z } from "zod";

export type ResponseType = "json" | "text" | "arrayBuffer";
export type HTTPMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
export type Body = FormData | Record<string, unknown>;

export type FetcherOptions<
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends z.ZodType | undefined = undefined
> = {
  responseType?: TResponseType;
  method: TMethod;
  url: string;
  body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
  schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
  throwOnError?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type CreateFetcherOptions = {
  baseURL?: string;
  apiErrorSchema?: z.ZodType;
};

export type FetcherFunction = <
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends z.ZodType | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>
) => Promise<FetcherReturn<TResponseType, TSchema>>;

export type FetcherReturn<
  TResponseType extends ResponseType | undefined,
  TSchema extends z.ZodType | undefined
> =
  | null
  | (TResponseType extends undefined
      ? TSchema extends undefined
        ? Record<string, unknown>
        : TSchema extends z.ZodType
        ? z.infer<TSchema>
        : Record<string, unknown>
      : TSchema extends undefined
      ? TResponseType extends "json"
        ? Record<string, unknown>
        : TResponseType extends "text"
        ? string
        : TResponseType extends "arrayBuffer"
        ? ArrayBuffer
        : Record<string, unknown>
      : TSchema extends z.ZodType
      ? TResponseType extends "json"
        ? z.infer<TSchema>
        : TResponseType extends "text"
        ? z.infer<TSchema>
        : TResponseType extends "arrayBuffer"
        ? ArrayBuffer
        : z.infer<TSchema>
      : TResponseType extends "json"
      ? Record<string, unknown>
      : TResponseType extends "text"
      ? string
      : TResponseType extends "arrayBuffer"
      ? ArrayBuffer
      : Record<string, unknown>);

export type TransformedData<TResponseType extends ResponseType> =
  TResponseType extends "json"
    ? Record<string, string>
    : TResponseType extends "text"
    ? string
    : TResponseType extends "arrayBuffer"
    ? ArrayBuffer
    : Record<string, string>;
