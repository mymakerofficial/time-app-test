import { t } from 'elysia'

export namespace TimeEntriesModel {
  export const RangeQuery = t.Object({
    start: t.Integer(),
    end: t.Integer(),
  })
  export type RangeQuery = typeof RangeQuery.static
}
