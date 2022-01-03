import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NPV', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should ignore logical and text values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1, B1:C1)' }, { cellValue: 1 }, { cellValue: 'abcd' }],
      [{ cellValue: '=NPV(1, B2:C2)' }, { cellValue: true }, { cellValue: 1 }],
      [{ cellValue: '=NPV(-1, 0)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0.5)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
  })

  it('should be compatible with product #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1, TRUE(), 1)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.75) //product #1 returns 0.5
  })

  it('order of arguments matters', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1, A2:B3)' }],
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1.625)
  })

  it('should return correct error value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1, NA())' }],
      [{ cellValue: '=NPV(1, 1, "abcd")' }],
      [{ cellValue: '=NPV(-1,1)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  /**
   * Inconsistency with products #1 and #2.
   */
  it('cell reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NPV(1,B1)' }, { cellValue: true }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5) //Both products #1 and #2 return 0 here.
  })
})
