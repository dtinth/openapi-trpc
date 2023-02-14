# openapi-trpc

_Not to be confused with [trpc-openapi](https://github.com/jlalmes/trpc-openapi)._

The `openapi-trpc` package is a tool to generate OpenAPI v3 spec from a [tRPC](https://trpc.io) router, adhering to tRPC’s [HTTP RPC Specification](https://trpc.io/docs/rpc). This lets you take an existing tRPC router, and generate an OpenAPI spec from it. From there, you can use the spec to generate a client, or use it to document your API.

## Synopsis

When initializing tRPC with `initTRPC`, add `.meta<OperationMeta>()` to the chain:

```ts
import { initTRPC } from '@trpc/server'
import { OperationMeta } from 'openapi-trpc'

const t = initTRPC.meta<OperationMeta>().create()
```

Whenever you want to generate an OpenAPI spec, call `generateOpenAPIDocumentFromTRPCRouter()`:

```ts
import { generateOpenAPIDocumentFromTRPCRouter } from 'openapi-trpc'
import { appRouter } from './router'

const doc = generateOpenAPIDocumentFromTRPCRouter(appRouter, {
  pathPrefix: '/trpc',
})
```

## `openapi-trpc` vs `trpc-openapi`

`openapi-trpc` (this library):

- Generates an OpenAPI v3 document according to the existing [HTTP RPC Specification](https://trpc.io/docs/rpc). It is not RESTful, but matches how a normal tRPC client talks to the server. You API looks like this: `GET /trpc/sayHello?input={"name":"James"}`.
- Does not require adding any extra request handlers to your app.
- Unproven code, full of hacks, PoC-quality code. However the scope of the library is very small and it works well enough for me.

[`trpc-openapi`](https://github.com/jlalmes/trpc-openapi):

- Generates RESTful endpoints. You can customize the path and HTTP method of each endpoint. You get nice-looking RESTful APIs like `GET /say-hello?name=James`. This requires adding an extra request handler to your app [which comes with its own limitations](https://github.com/jlalmes/trpc-openapi#requirements).
- Works with Express, Next.js, Serverless, and Node:HTTP servers. No adapters for Fetch, Fastify, Nuxt, or Workers yet.
- Well-tested, well-documented and well-maintained.
