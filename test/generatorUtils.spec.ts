import {empty, first, split} from '../src/generatorUtils'

describe('empty', () => {
  it('works', () => {
    expect(Array.from(empty())).toEqual([])
  })
})

describe('split', () => {
  it('works for empty case', () => {
    const result = split(empty())

    expect(result.value).toBe(undefined)
    expect(Array.from(result.rest)).toEqual([])
  })

  it('works for one element case', () => {
    const arr = [{ cellValue: 42 }]

    const result = split(arr[Symbol.iterator]())

    expect(result.value?.cellValue).toBe(42)
    expect(Array.from(result.rest)).toEqual([])
  })

  it('works for more elements case', () => {
    const arr = [{ cellValue: 42 }, { cellValue: 43 }]

    const result = split(arr[Symbol.iterator]())

    expect(result.value?.cellValue).toBe(42)
    expect(Array.from(result.rest)).toEqual([43])
  })
})

describe('first', () => {
  it('works for empty case', () => {
    expect(first(empty())).toBe(undefined)
  })

  it('works for one element case', () => {
    const arr = [{ cellValue: 42 }]

    expect(first(arr[Symbol.iterator]())?.cellValue).toEqual(42)
  })

  it('works for more elements case', () => {
    const arr = [{ cellValue: 42 }, { cellValue: 43 }]

    expect(first(arr[Symbol.iterator]())?.cellValue).toEqual(42)
  })
})
