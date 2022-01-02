import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISERR', () => {
  it('should return true for common errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISERR(1/0)' }, { cellValue: '=ISERR(FOO())' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(true)
    expect(engine.getCellValue(adr('B1'))).toEqual(true)
  })

  it('should return false for #N/A!', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISERR(TRUE(1))' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(false)
  })

  it('should return false for valid formulas', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISERR(1)' }, { cellValue: '=ISERR(TRUE())' }, { cellValue: '=ISERR("foo")' }, { cellValue: '=ISERR(ISERR(1/0))'}, {cellValue: '=ISERR(A1)' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(false)
    expect(engine.getCellValue(adr('B1'))).toEqual(false)
    expect(engine.getCellValue(adr('C1'))).toEqual(false)
    expect(engine.getCellValue(adr('D1'))).toEqual(false)
    expect(engine.getCellValue(adr('E1'))).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISERR(1, 2)' }, { cellValue: '=ISERR()' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/1' }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=4/2' }],
      [{ cellValue: '=ISERR(A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
