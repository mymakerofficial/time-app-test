import { customType } from 'drizzle-orm/pg-core'
import { hexToUint8, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { isString } from '@time-app-test/shared/guards.ts'

export const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
})

export const byteaToHex = customType<{ data: string }>({
  dataType() {
    return 'bytea'
  },
  toDriver(value) {
    return hexToUint8(value)
  },
  fromDriver(value) {
    if (isString(value)) return value // assume it's already hex
    return uint8ToHex(value as Uint8Array)
  },
})
