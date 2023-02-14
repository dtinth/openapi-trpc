import { zodToJsonSchema } from 'zod-to-json-schema'
import { Procedure, Router } from './dummyRouter'
import { z, AnyZodObject, ZodType } from 'zod'
import { OpenAPIV3 } from 'openapi-types'
import { allowedOperationKeys } from './meta'

export function generateOpenAPIDocumentFromTRPCRouter(
  inRouter: any,
  options: GenerateOpenAPIDocumentOptions = {},
) {
  const router: Router = inRouter
  const procs = router._def.procedures
  const paths: OpenAPIV3.PathsObject = {}
  for (const [procName, proc] of Object.entries(procs)) {
    const procDef = proc._def as unknown as Procedure
    const input = procDef.inputs
      .slice(1)
      .reduce<AnyZodObject>(
        (acc, cur) => asZodObject(acc).merge(asZodObject(cur)),
        asZodObject(procDef.inputs[0] || z.object({})),
      )
    const output = procDef.output
    const inputSchema = toJsonSchema(input)
    const outputSchema = output ? toJsonSchema(asZodType(output)) : undefined
    const key = [
      '',
      ...(options.pathPrefix || '/').split('/').filter(Boolean),
      procName,
    ].join('/')
    const responses = {
      200: {
        description: (output && asZodType(output).description) || '',
        ...(outputSchema
          ? {
              content: {
                'application/json': {
                  schema: outputSchema as any,
                },
              },
            }
          : {}),
      },
    }
    const operationInfo: Partial<OpenAPIV3.OperationObject> = {
      tags: procName.split('.').slice(0, -1).slice(0, 1),
    }
    for (const key of allowedOperationKeys) {
      const value = procDef.meta?.[key]
      if (value) {
        operationInfo[key] = value as any
      }
    }
    if (procDef.query) {
      paths[key] = {
        get: {
          ...operationInfo,
          operationId: procName,
          responses,
          parameters: [
            {
              in: 'query',
              name: 'input',
              content: {
                'application/json': {
                  schema: inputSchema as any,
                },
              },
            },
          ],
        },
      }
    } else {
      paths[key] = {
        post: {
          ...operationInfo,
          operationId: procName,
          responses,
          requestBody: {
            content: {
              'application/json': {
                schema: inputSchema as any,
              },
            },
          },
        },
      }
    }
  }
  const api: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
      title: 'tRPC HTTP-RPC',
      version: '',
    },
    paths,
  }
  return api
}

function getZodTypeName(input: unknown) {
  return (input as { _def?: { typeName?: string } } | undefined)?._def?.typeName
}

function asZodObject(input: unknown) {
  if (getZodTypeName(input) !== 'ZodObject') {
    throw new Error('Expected a ZodObject, received: ' + String(input))
  }
  return input as AnyZodObject
}

function asZodType(input: unknown) {
  if (!getZodTypeName(input)) {
    throw new Error('Expected a Zod schema, received: ' + String(input))
  }
  return input as ZodType
}

export interface GenerateOpenAPIDocumentOptions {
  pathPrefix?: string
}

function toJsonSchema(input: ZodType) {
  const { $schema, ...output } = zodToJsonSchema(input)
  return output
}
