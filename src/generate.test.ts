import { initTRPC } from '@trpc/server'
import { generateOpenAPIDocumentFromTRPCRouter } from './generate'
import { OperationMeta } from './meta'
import { z } from 'zod'
import { createDummyRouter } from './dummyRouter'
import fs from 'fs'

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
