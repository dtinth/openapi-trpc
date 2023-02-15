# openapi-trpc

_Not to be confused with [trpc-openapi](https://github.com/jlalmes/trpc-openapi)._

The `openapi-trpc` package is a tool to generate OpenAPI v3 spec from a [tRPC](https://trpc.io) router, adhering to tRPC’s [HTTP RPC Specification](https://trpc.io/docs/rpc). This lets you take an existing tRPC router, and generate an OpenAPI spec from it. From there, you can use the spec to generate a client, or use it to document your API.

## Usage

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

Inside your procedures, you can add metadata to the OpenAPI spec by adding `.meta()` to the chain. If the meta object contains the [`deprecated`, `description`, `externalDocs`, `summary`, or `tags` keys](https://swagger.io/specification/#operation-object), they will be added to the OpenAPI spec.

In your Zod schema (yes, you must use Zod, as other schema libraries are not supported), you can use `.describe()` to add a description to each field, and they will be added to the schema in the OpenAPI spec (thanks to [zod-to-json-schema](https://www.npmjs.com/package/zod-to-json-schema)).

```ts
t.procedure
  .meta({ summary: '…', description: '…' })
  .input(
    z.object({
      id: z.number().describe('…'),
      /* ... */
    }),
  )
  .query(() => {
    /* … */
  })
```

You can then use the `doc` to generate API documentation or a client.

![basic](https://user-images.githubusercontent.com/193136/218788215-f7f9892b-c120-403e-ba4d-ebf334f5a2a6.png)

More advanced usage:

- You can use your own type for the meta object, to [add extra metadata to the tRPC procedure](https://trpc.io/docs/metadata). It is recommended that the type should extend `OperationMeta`.

- You can also provide `processOperation` to customize the OpenAPI spec on a per-operation (i.e. tRPC procedure) basis. This allows adding more metadata to the spec, such as `security` (for authentication) or `servers`. The function is called with the operation’s OpenAPI spec, and the tRPC procedure’s metadata. It may mutate the spec, or return a new one. For more information, [see the tests](./src/generate.test.ts).

## `openapi-trpc` vs `trpc-openapi`

`openapi-trpc` (this library):

- Generates an OpenAPI v3 document according to the existing [HTTP RPC Specification](https://trpc.io/docs/rpc). It is not RESTful, but matches how a normal tRPC client talks to the server. You API looks like this: `GET /trpc/sayHello?input={"name":"James"}`.
- Does not require adding any extra request handlers to your app.
- Unproven code, full of hacks, PoC-quality code. However the scope of the library is very small and it works well enough for me.

[`trpc-openapi`](https://github.com/jlalmes/trpc-openapi):

- Generates RESTful endpoints. You can customize the path and HTTP method of each endpoint. You get nice-looking RESTful APIs like `GET /say-hello?name=James`. This requires adding an extra request handler to your app [which comes with its own limitations](https://github.com/jlalmes/trpc-openapi#requirements).
- Works with Express, Next.js, Serverless, and Node:HTTP servers. No adapters for Fetch, Fastify, Nuxt, or Workers yet.
- Well-tested, well-documented and well-maintained.
