import { initTRPC } from '@trpc/server'
import fs from 'fs'
import { z } from 'zod'
import { createDummyRouter } from './dummyRouter'
import { generateOpenAPIDocumentFromTRPCRouter } from './generate'
import { OperationMeta } from './meta'

it('works', () => {
  const t = initTRPC.meta<OperationMeta>().create()
  const router = t.router({
    example: t.router({
      createGreeting: t.procedure
        .meta({ summary: 'Creates a greeting' })
        .input(
          z
            .object({
              name: z.string().optional().describe('The name to greet'),
            })
            .describe('Input for createGreeting'),
        )
        .output(z.string().describe('The greeting text'))
        .mutation(() => 'ok'),
      hello: t.procedure
        .input(z.object({ text: z.string() }))
        .query(() => null),
      getAll: t.procedure
        .output(z.array(z.object({ id: z.string() })))
        .query(() => []),
    }),
    dummy: createDummyRouter(t),
  })
  const doc = generateOpenAPIDocumentFromTRPCRouter(router, {
    pathPrefix: '/trpc',
  })
  fs.mkdirSync('temp/examples', { recursive: true })
  fs.writeFileSync('temp/examples/basic.json', JSON.stringify(doc, null, 2))
  expect(doc).toMatchSnapshot()
})

it('works with array', () => {
  const t = initTRPC.meta<OperationMeta>().create()
  const router = t.router({
    exampleWithArrayAsInput: t.router({
      queryWithArrayInput: t.procedure
        .input(z.array(z.string()))
        .query(() => null),
    }),
    dummy: createDummyRouter(t),
  })
  const doc = generateOpenAPIDocumentFromTRPCRouter(router, {
    pathPrefix: '/trpc',
  })
  fs.mkdirSync('temp/examples', { recursive: true })
  fs.writeFileSync('temp/examples/array.json', JSON.stringify(doc, null, 2))
  expect(doc).toMatchSnapshot()
})

it('lets you post-process each operation, giving typed access to the meta', () => {
  interface AppMeta extends OperationMeta {
    requiresAuth?: boolean
  }
  const t = initTRPC.meta<AppMeta>().create()
  const router = t.router({
    public: t.procedure.query(() => null),
    private: t.procedure.meta({ requiresAuth: true }).query(() => null),
  })
  const doc = generateOpenAPIDocumentFromTRPCRouter(router, {
    pathPrefix: '/trpc',
    processOperation: (op, meta) => {
      if (meta?.requiresAuth) {
        op.security = [{ bearerAuth: [] }]
      }
    },
  })
  fs.mkdirSync('temp/examples', { recursive: true })
  fs.writeFileSync(
    'temp/examples/operation-processing.json',
    JSON.stringify(doc, null, 2),
  )
  expect(doc).toMatchSnapshot()
})
