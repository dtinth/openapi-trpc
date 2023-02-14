import { OpenAPIV3 } from 'openapi-types'

function defineKeys<T extends keyof OpenAPIV3.OperationObject>(keys: T[]): T[] {
  return keys
}

export const allowedOperationKeys = defineKeys([
  'deprecated',
  'description',
  'externalDocs',
  'summary',
  'tags',
])

export interface OperationMeta
  extends Pick<
    OpenAPIV3.OperationObject,
    typeof allowedOperationKeys[number]
  > {}
