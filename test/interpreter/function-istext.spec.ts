import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISTEXT', () => {
  it('should return true for text', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISTEXT("abcd")' }, { cellValue: '=ISTEXT(A2)' }],
      [{ cellValue: 'abcd' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
  })

  it('should return false for nontext', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISTEXT(-0)' }, { cellValue: '=ISTEXT(A2)' }, { cellValue: '=ISTEXT(1<1)' }],
      [{ cellValue: null }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISTEXT(1, 2)' }, { cellValue: '=ISTEXT()' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/1' }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=4/2' }],
      [{ cellValue: '=ISTEXT(A1:A3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
