import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISNA', () => {
  it('should return true for #NA! error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE(1)' }, { cellValue: '=ISNA(A1)' }, { cellValue: '=ISNA(TRUE(1))' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
  })

  it('should return false for other values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNA(1)' }, { cellValue: '=ISNA(TRUE())' }, { cellValue: '=ISNA("foo")' }, { cellValue: '=ISNA(A1)'}],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNA(1, 2)' }, { cellValue: '=ISNA()' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE(1)' }],
      [{ cellValue: '=TRUE(1)' }],
      [{ cellValue: '=ISNA(A1:A2)' }],
    ])
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
