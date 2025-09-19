import { describe, expect, it } from 'vitest'
import { Container } from '@/helper/container/container.ts'

describe('Container', () => {
  it('builds sync', () => {
    const res = new Container().add('foo', () => 'bar').build()

    expect(res).toEqual({
      foo: 'bar',
    })
  })

  it('builds async', async () => {
    const res = await new Container().add('foo', async () => 'bar').buildAsync()

    expect(res).toEqual({
      foo: 'bar',
    })
  })

  it('builds in order', () => {
    const res = new Container()
      .add('fizz', () => 'fizz')
      .add('buzz', ({ fizz }) => `${fizz}buzz`)
      .build()

    expect(res).toEqual({
      fizz: 'fizz',
      buzz: 'fizzbuzz',
    })
  })

  it('builds in order async', async () => {
    const res = await new Container()
      .add('fizz', async () => 'fizz')
      .add('buzz', ({ fizz }) => `${fizz}buzz`)
      .buildAsync()

    expect(res).toEqual({
      fizz: 'fizz',
      buzz: 'fizzbuzz',
    })
  })
})
