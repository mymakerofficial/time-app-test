import {
  Column,
  GetColumnData,
  InferColumnsDataTypes,
} from 'drizzle-orm/column'
import { sql } from 'drizzle-orm'
import { hasProperty, isObject } from '@time-app-test/shared/guards.ts'

function getColumn(col: Column) {
  if (col.getSQLType() === 'bytea') {
    // we can't use bytea directly in json functions, so we encode it to hex
    //  this will store the bytea as a hex string in json
    return sql`encode(${col}, 'hex')`
  }
  return col
}

function buildJsonObject<TColumns extends Record<string, Column>>(
  columns: TColumns,
) {
  const entries = Object.entries(columns).flatMap(([key, col]) => [
    sql`'${sql.raw(key)}'`,
    getColumn(col),
  ])
  return sql`json_build_object(${sql.join(entries, sql.raw(', '))})`
}

function dropNullItems(item: unknown): item is object {
  return !!item && isObject(item) && Object.values(item).some((v) => v !== null)
}

function mapColumn<K extends string, C extends Column>(
  item: object,
  key: K,
  col: C,
): GetColumnData<C> {
  if (!hasProperty(item, key)) throw new Error(`Key ${key} not found in item`)
  return col.mapFromDriverValue(item[key])
}

function mapObject<TColumns extends Record<string, Column>>(
  item: object,
  columns: TColumns,
) {
  return Object.fromEntries(
    Object.entries(columns).map(([key, col]) => [
      key,
      mapColumn(item, key, col),
    ]),
  ) as InferColumnsDataTypes<TColumns>
}

export function jsonAgg<TColumns extends Record<string, Column>>(
  columns: TColumns,
) {
  return sql`json_agg(${buildJsonObject(columns)})`.mapWith({
    mapFromDriverValue: (value: unknown) => {
      if (!Array.isArray(value)) return []
      return value.filter(dropNullItems).map((item) => mapObject(item, columns))
    },
  })
}
