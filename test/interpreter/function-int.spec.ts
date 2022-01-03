import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function INT', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INT()' }, { cellValue: '=INT(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for positive numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INT(1.3)' }, { cellValue: '=INT(1.7)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('works for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INT(-1.3)' }, { cellValue: '=INT(-1.7)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(-1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(-1)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INT("42.3")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(42)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=INT(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
