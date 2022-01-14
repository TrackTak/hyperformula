import {findBoundaries} from '../src/Sheet'

describe('findBoundaries', () => {
  it('find correct dimensions', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
    ])).toMatchObject({height: 2, width: 3})
  })

  it('find correct dimensions when empty cell at the end of row', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: null }],
    ])).toMatchObject({height: 2, width: 2})
  })

  it('find correct dimensions when empty cell in the middle of the row', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: null }, { cellValue: '4'}],
    ])).toMatchObject({height: 2, width: 4})
  })

  it('find correct dimensions when empty row', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: null }],
      [],
    ])).toMatchObject({height: 2, width: 2})
  })

  it('returns sane dimensions for empty cases', () => {
    expect(findBoundaries([])).toMatchObject({height: 0, width: 0})
    expect(findBoundaries([[]])).toMatchObject({height: 0, width: 0})
  })

  it('calculate correct fill for array with different size', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
    ])).toMatchObject({fill: 5 / 6})
  })

  it('calculate correct fill for empty arrays', () => {
    expect(findBoundaries([]).fill).toBe(0)
    expect(findBoundaries([[]]).fill).toBe(0)
  })

  it('calculate correct fill for array with one element', () => {
    expect(findBoundaries([[{ cellValue: null }]]).fill).toBe(0)
    expect(findBoundaries([[{ cellValue: 'x' }]]).fill).toBe(1)
  })

  it('does count empty string', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: '' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
    ])).toMatchObject({fill: 1})
  })

  it('does not count empty value', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: null }],
      [{ cellValue: '1' }, { cellValue: '2' }],
    ])).toMatchObject({fill: 3 / 4})
  })

  it('does not count null', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: null }],
      [{ cellValue: '1' }, { cellValue: '2' }],
    ])).toMatchObject({fill: 3 / 4})
  })

  it('does not count undefined', () => {
    expect(findBoundaries([
      [{ cellValue: '1' }, { cellValue: undefined }],
      [{ cellValue: '1' }, { cellValue: '2' }],
    ])).toMatchObject({fill: 3 / 4})
  })
})
