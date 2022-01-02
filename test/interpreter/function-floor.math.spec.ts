import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FLOOR.MATH', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR.MATH()' }],
      [{ cellValue: '=FLOOR.MATH(1, 2, 3, 4)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR.MATH("foo")' }],
      [{ cellValue: '=FLOOR.MATH(1, "bar")' }],
      [{ cellValue: '=FLOOR.MATH(1, 2, "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR.MATH(4.43, 0.3)' }],
      [{ cellValue: '=FLOOR.MATH(4.43, 0.6)' }],
      [{ cellValue: '=FLOOR.MATH(4.43, 2)' }],
      [{ cellValue: '=FLOOR.MATH(4.43)' }],
      [{ cellValue: '=FLOOR.MATH(-4.43)' }],
      [{ cellValue: '=FLOOR.MATH(-3.14, -1.8)' }],
      [{ cellValue: '=FLOOR.MATH(-3.14, 0)' }],
      [{ cellValue: '=FLOOR.MATH(3.14, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(4.2)
    expect(engine.getCellValue(adr('A2'))).toEqual(4.2)
    expect(engine.getCellValue(adr('A3'))).toEqual(4)
    expect(engine.getCellValue(adr('A4'))).toEqual(4)
    expect(engine.getCellValue(adr('A5'))).toEqual(-5)
    expect(engine.getCellValue(adr('A6'))).toEqual(-3.6)
    expect(engine.getCellValue(adr('A7'))).toEqual(0)
    expect(engine.getCellValue(adr('A8'))).toEqual(0)
  })

  it('should work with mode for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR.MATH(-11, -2)' }],
      [{ cellValue: '=FLOOR.MATH(-11, -2, 0)' }],
      [{ cellValue: '=FLOOR.MATH(-11, -2, 1)' }],
      [{ cellValue: '=FLOOR.MATH(-11, 0, 1)' }],
      [{ cellValue: '=FLOOR.MATH(-11, 0, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(-12)
    expect(engine.getCellValue(adr('A2'))).toEqual(-12)
    expect(engine.getCellValue(adr('A3'))).toEqual(-10)
    expect(engine.getCellValue(adr('A4'))).toEqual(0)
    expect(engine.getCellValue(adr('A5'))).toEqual(0)
  })

  it('negative values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR.MATH(11, 2, 0)' }],
      [{ cellValue: '=FLOOR.MATH(-11, 2, 0)' }],
      [{ cellValue: '=FLOOR.MATH(11, -2, 0)' }],
      [{ cellValue: '=FLOOR.MATH(-11, -2, 0)' }],
      [{ cellValue: '=FLOOR.MATH(11, 2, 1)' }],
      [{ cellValue: '=FLOOR.MATH(-11, 2, 1)' }],
      [{ cellValue: '=FLOOR.MATH(11, -2, 1)' }],
      [{ cellValue: '=FLOOR.MATH(-11, -2, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(10)
    expect(engine.getCellValue(adr('A2'))).toEqual(-12)
    expect(engine.getCellValue(adr('A3'))).toEqual(10)
    expect(engine.getCellValue(adr('A4'))).toEqual(-12)
    expect(engine.getCellValue(adr('A5'))).toEqual(10)
    expect(engine.getCellValue(adr('A6'))).toEqual(-10)
    expect(engine.getCellValue(adr('A7'))).toEqual(10)
    expect(engine.getCellValue(adr('A8'))).toEqual(-10)
  })
})
