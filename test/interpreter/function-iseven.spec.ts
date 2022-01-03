import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISEVEN', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISEVEN()' }, { cellValue: '=ISEVEN(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISEVEN(1)' }, { cellValue: '=ISEVEN(2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(true)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISEVEN("42")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=ISEVEN(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
