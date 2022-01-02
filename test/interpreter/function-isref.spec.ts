import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISREF', () => {
  it('should return true for #REF!', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=#REF!' }, { cellValue: '=ISREF(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqual(true)
  })

  it('should return true for #CYCLE!', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A1' }, { cellValue: '=ISREF(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqual(true)
  })

  it('should return false for other values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISREF(1)' }, { cellValue: '=ISREF(TRUE())' }, { cellValue: '=ISREF("foo")' }, { cellValue: '=ISREF(A1)'}],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(false)
    expect(engine.getCellValue(adr('B1'))).toEqual(false)
    expect(engine.getCellValue(adr('C1'))).toEqual(false)
    expect(engine.getCellValue(adr('D1'))).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISREF(1, 2)' }, { cellValue: '=ISREF()' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  // Inconsistency with Product 1
  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A1' }],
      [{ cellValue: '=A2' }],
      [],
      [{ cellValue: '=ISREF(A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  // Inconsistency with Product 1
  it('returns #CYCLE! for itself', () => {
    /* TODO can we handle such case correctly? */
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISREF(A1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.CYCLE))
  })
})
