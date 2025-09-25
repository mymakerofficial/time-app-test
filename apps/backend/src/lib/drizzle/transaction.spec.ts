import { expect, test } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { pgliteDrizzle } from '@/lib/drizzle/drizzle.ts'

const foo = pgTable('foo', {
  message: varchar(),
})

test('drizzle transaction', async () => {
  const client = new PGlite()

  await client.exec(`CREATE TABLE foo (
    message varchar
  );`)

  const db = await pgliteDrizzle({ client, schema: { foo } })

  await db.insert(foo).values({ message: 'no transaction' })

  const tx1 = await db.createTransaction()
  await tx1.insert(foo).values({ message: 'tx1' })
  const tx2 = await tx1.createTransaction()
  await tx2.insert(foo).values({ message: 'tx2' })
  await tx2.rollback()
  await tx1
    .transaction(async (tx3) => {
      await tx3.insert(foo).values({ message: 'tx3' })
      throw new Error('lol')
    })
    .catch(() => {})
  await tx1.transaction(async (tx4) => {
    await tx4.insert(foo).values({ message: 'tx4' })
  })
  await tx1.commit()
  const tx5 = await db.createTransaction()
  await tx5.insert(foo).values({ message: 'tx5' })
  await tx5.commit()

  expect(await db.select().from(foo)).toEqual([
    { message: 'no transaction' },
    { message: 'tx1' },
    { message: 'tx4' },
    { message: 'tx5' },
  ])
})
