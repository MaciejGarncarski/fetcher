# Fetcher

A lightweight and simple fetch wrapper for Node.js and potentially the browser.

[![NPM Version](https://img.shields.io/npm/v/@maciekdev/fetcher)](https://www.npmjs.com/package/@maciekdev/fetcher)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Fetcher provides a minimal and straightforward way to make HTTP requests using the familiar `fetch` API. It aims to simplify common use cases without adding unnecessary complexity.

## Features

- **Lightweight:** Minimal dependencies and a small footprint.
- **Simple API:** Mirrors the standard `fetch` API for ease of use.
- **Promise-based:** Leverages promises for asynchronous operations.
- **TypeScript Support:** Written in TypeScript with type definitions included.
- **Node.js Compatible:** Designed for use in Node.js environments.
- **Potentially Isomorphic:** (To be confirmed/developed) May work in browser environments as well.

## Installation

```bash
pnpm add @maciekdev/fetcher
# or
npm install @maciekdev/fetcher
# or
yarn add @maciekdev/fetcher
# or
bun add  @maciekdev/fetcher
```

## Example usage

```ts
import { z } from "zod";
import { fetcher } from "@maciekdev/fetcher";

const testSchema = z.object({
  data: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

const response = await fetcher({
  method: "GET",
  url: "/",
  schema: testSchema,
});

/*
Typesafe response!

data: {
    id: number;
    username: string;
} | undefined
*/
```
