import { describe, expect, it } from 'vitest'
import { Container } from '@/lib/container.ts'

describe('Container', () => {
  it('builds sync', () => {
    expect(new Container().add('foo', () => 'bar').build()).toEqual({
      foo: 'bar',
    })
  })

  it('builds async', async () => {
    expect(
      await new Container()
        .add('foo', () => Promise.resolve('bar'))
        .buildAsync(),
    ).toEqual({
      foo: 'bar',
    })
  })

  it('builds in order', () => {
    expect(
      new Container()
        .add('fizz', () => 'fizz')
        .add('buzz', ({ fizz }) => `${fizz}buzz`)
        .build(),
    ).toEqual({
      fizz: 'fizz',
      buzz: 'fizzbuzz',
    })
  })

  it('builds in order async', async () => {
    expect(
      await new Container()
        .add('fizz', () => Promise.resolve('fizz'))
        .add('buzz', ({ fizz }) => Promise.resolve(`${fizz}buzz`))
        .buildAsync(),
    ).toEqual({
      fizz: 'fizz',
      buzz: 'fizzbuzz',
    })
  })
})
