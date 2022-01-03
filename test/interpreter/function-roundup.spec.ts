import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ROUNDUP', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP()' }, { cellValue: '=ROUNDUP(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for positive numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP(1.3)' }, { cellValue: '=ROUNDUP(1.7)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(2)
  })

  it('works for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP(-1.3)' }, { cellValue: '=ROUNDUP(-1.7)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(-2)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(-2)
  })

  it('works with positive rounding argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP(1.43, 1)' }, { cellValue: '=ROUNDUP(1.47, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1.5)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1.5)
  })

  it('works with negative rounding argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP(43, -1)' }, { cellValue: '=ROUNDUP(47, -1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(50)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(50)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROUNDUP("42.3")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(43)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=ROUNDUP(A1)' }, { cellValue: '=ROUNDUP(42, A1)' }, { cellValue: '=ROUNDUP(A1, FOO())' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
