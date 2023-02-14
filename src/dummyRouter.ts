import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { OperationMeta } from './meta'

export const createDummyRouter = (
  t = initTRPC.meta<OperationMeta>().create(),
) => {
  return t.router({
    hello: t.router({
      world: t.procedure
        .meta({ description: 'ok' })
        .input(z.object({ name: z.string() }))
        .output(z.string())
        .query(() => 'hello world'),
    }),
  })
}

export type DummyRouter = ReturnType<typeof createDummyRouter>
export type DummyProcedure = ReturnType<
  typeof createDummyRouter
>['_def']['procedures']['hello']['_def']['procedures']['world']['_def']
