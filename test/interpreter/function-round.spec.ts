import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ROUND', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND()' }, { cellValue: '=ROUND(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for positive numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND(1.3)' }, { cellValue: '=ROUND(1.7)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(2)
  })

  it('works for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND(-1.3)' }, { cellValue: '=ROUND(-1.7)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(-1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(-2)
  })

  it('no -0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND(-0.001)' }, { cellValue: '=ROUND(0.001)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(0)
  })

  it('works with positive rounding argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND(1.43, 1)' }, { cellValue: '=ROUND(1.47, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1.4)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1.5)
  })

  it('works with negative rounding argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND(43, -1)' }, { cellValue: '=ROUND(47, -1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(40)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(50)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ROUND("42.3")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(42)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=ROUND(A1)' }, { cellValue: '=ROUND(42, A1)' }, { cellValue: '=ROUND(A1, FOO())' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
