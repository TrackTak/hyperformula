import {ArrayValue} from '../src/ArrayValue'
import {EmptyValue} from '../src/interpreter/InterpreterValue'

describe('Matrix', () => {
  it('fill', () => {
    const matrix = new ArrayValue([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(matrix.raw()).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('add rows', () => {
    const matrix = new ArrayValue([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
    ])
    matrix.addRows(1, 3)
    expect(matrix.raw()).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [EmptyValue, EmptyValue, EmptyValue],
      [EmptyValue, EmptyValue, EmptyValue],
      [EmptyValue, EmptyValue, EmptyValue],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
    ])
    expect(matrix.height()).toEqual(6)
  })

  it('remove rows', () => {
    const matrix = new ArrayValue([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
      [{ cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }],
    ])
    matrix.removeRows(1, 2)
    expect(matrix.height()).toEqual(2)
    expect(matrix.raw()).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 7 }, { cellValue: 8 }],
    ])
  })

  it('remove rows out of bound', () => {
    const matrix = new ArrayValue([
      [{ cellValue: 1 }, { cellValue: 2 }],
    ])
    expect(() => {
      matrix.removeRows(1, 1)
    }).toThrowError('Array index out of bound')
  })
})
