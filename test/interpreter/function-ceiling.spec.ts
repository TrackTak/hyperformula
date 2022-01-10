import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CEILING', () => {
  /*Inconsistent with ODFF standard.*/
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING(1)' }],
      [{ cellValue: '=CEILING(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING(1, "bar")' }],
      [{ cellValue: '=CEILING("bar", 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING(4.43, 0.3)' }],
      [{ cellValue: '=CEILING(4.43, 0.6)' }],
      [{ cellValue: '=CEILING(4.43, 2)' }],
      [{ cellValue: '=CEILING(-3.14, -1.8)' }],
      [{ cellValue: '=CEILING(-3.14, 0)' }],
      [{ cellValue: '=CEILING(3.14, 0)' }],
      [{ cellValue: '=CEILING(0, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4.5)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4.8)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-3.6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  /*Inconsistent with ODFF standard.*/
  it('negative values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING(11, 2)' }],
      [{ cellValue: '=CEILING(-11, 2)' }],
      [{ cellValue: '=CEILING(11, -2)' }],
      [{ cellValue: '=CEILING(-11, -2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-10)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-12)
  })
})
