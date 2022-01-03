import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FLOOR', () => {
  /*Inconsistent with ODFF standard.*/
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR(1)' }],
      [{ cellValue: '=FLOOR(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR(1, "bar")' }],
      [{ cellValue: '=FLOOR("bar", 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR(4.43, 0.3)' }],
      [{ cellValue: '=FLOOR(4.43, 0.6)' }],
      [{ cellValue: '=FLOOR(4.43, 2)' }],
      [{ cellValue: '=FLOOR(-3.14, -1.8)' }],
      [{ cellValue: '=FLOOR(-3.14, 0)' }],
      [{ cellValue: '=FLOOR(3.14, 0)' }],
      [{ cellValue: '=FLOOR(0, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4.2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4.2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-1.8)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  /*Inconsistent with ODFF standard.*/
  it('negative values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FLOOR(11, 2)' }],
      [{ cellValue: '=FLOOR(-11, 2)' }],
      [{ cellValue: '=FLOOR(11, -2)' }],
      [{ cellValue: '=FLOOR(-11, -2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-12)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-10)
  })
})
