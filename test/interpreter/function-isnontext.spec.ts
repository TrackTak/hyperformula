import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISNONTEXT', () => {
  it('should return false for text', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNONTEXT("abcd")' }, { cellValue: '=ISNONTEXT(A2)' }],
      [{ cellValue: 'abcd' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(false)
    expect(engine.getCellValue(adr('B1'))).toEqual(false)
  })

  it('should return true for nontext', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNONTEXT(-0)' }, { cellValue: '=ISNONTEXT(A2)' }, { cellValue: '=ISNONTEXT(1<1)' }],
      [{ cellValue: null }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(true)
    expect(engine.getCellValue(adr('B1'))).toEqual(true)
    expect(engine.getCellValue(adr('C1'))).toEqual(true)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNONTEXT(1, 2)' }, { cellValue: '=ISNONTEXT()' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/1' }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=4/2' }],
      [{ cellValue: '=ISNONTEXT(A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
