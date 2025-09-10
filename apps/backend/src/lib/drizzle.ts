import { customType } from 'drizzle-orm/pg-core'

export const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
})
