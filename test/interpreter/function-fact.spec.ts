import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FACT', () => {
  it('checks number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT()' }, { cellValue: '=FACT(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT(0)' }],
      [{ cellValue: '=FACT(1)' }],
      [{ cellValue: '=FACT(10)' }],
      [{ cellValue: '=FACT(170)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(3628800)
    expect(engine.getCellValue(adr('A4')).cellValue as number / 7.257415615307999e+306).toBeCloseTo(1, 6)
  })

  it('rounds argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT(0.9)' }],
      [{ cellValue: '=FACT(1.1)' }],
      [{ cellValue: '=FACT(10.42)' }],
      [{ cellValue: '=FACT(169.9)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(3628800)
    expect(engine.getCellValue(adr('A4')).cellValue as number / 4.2690680090046997e+304).toBeCloseTo(1, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT(-1)' }],
      [{ cellValue: '=FACT(171)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('uses coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT("0")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FACT(NA())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
