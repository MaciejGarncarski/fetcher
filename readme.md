# Fetcher

A lightweight and simple fetch wrapper for Node.js and potentially the browser.

[![NPM Version](https://img.shields.io/npm/v/@maciekdev/fetcher)](https://www.npmjs.com/package/@maciekdev/fetcher)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![spring-easing's badge](https://deno.bundlejs.com/?q=@maciekdev/fetcher&badge=simple&badge-style=flat)](https://bundlejs.com/?q=@maciekdev/fetcher)

Fetcher provides a minimal and straightforward way to make HTTP requests using the familiar `fetch` API. It aims to simplify common use cases without adding unnecessary complexity.

## Features

- **Lightweight:** Minimal dependencies and a small footprint.
- **Simple API:** Mirrors the standard `fetch` API for ease of use.
- **TypeScript Support:** Written in TypeScript with type definitions included.

## Installation

```bash
pnpm add @maciekdev/fetcher
# or
npm install @maciekdev/fetcher
# or
yarn add @maciekdev/fetcher
# or
bun add @maciekdev/fetcher
```

## Example usage

```ts
// In this example, the `zod` library is used for schema validation.
// Fetcher is compatible with any standard schema validation library.

import { z } from "zod/v4";
import { createFetcherInstance } from "@maciekdev/fetcher";

export const fetcher = createFetcherInstance({
  baseURL: "https://yourApiPath.com",
});

const zodSchema = z.object({
  username: z.string(),
});

const myData = await fetcher({
  method: "GET",
  url: "/test-endpoint",
  schema: zodSchema,
});

console.log(myData?.data.username);
/*
username: string | undefined

Typesafe!
*/
```

## API reference

### createFetcherInstance(options | undefined)

**Parameters:**

- `options`?: (FetcherInstanceOptions) Configuration object for fetcher instance.

### fetcher(options)

**Parameters:**

- `options`?: (FetcherOptions) Configuration object for fetcher instance.

**Options config:**

```markdown
- `responseType`?: "json" | "text" | "arrayBuffer";
- `method`: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
- `url`: string;
- `body`?: FormData | Record<string, unknown>;
- `schema`?: `zodSchema`;
- `throwOnError`?: boolean;
- `signal`?: AbortSignal;
- `headers`?: Record<string, string>;
- `headersStrategy`?: "merge" | "overwrite" | "omit-global";
- `cache`?: "default" | "no-store" | "no-cache" | "force-cache" | "only-if-cached";
- `credentials`?: "include" | "omit" | "same-origin";
- `keepalive`?: boolean;
- `mode`?: "cors" | "no-cors" | "same-origin";
- `priority`?: "auto" | "high" | "low";
- `redirect`?: "follow" | "error" | "manual";
- `referrer`?: "about:client" | "client" | "no-referrer";
- `referrerPolicy`?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
- `integrity`?: string;
- `onErrorThrown`?: (error: Error) => void;
```

## License

MIT
