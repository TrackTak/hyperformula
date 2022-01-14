import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FACTDOUBLE', () => {
  it('checks number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE()' }, { cellValue: '=FACTDOUBLE(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE(0)' }],
      [{ cellValue: '=FACTDOUBLE(1)' }],
      [{ cellValue: '=FACTDOUBLE(10)' }],
      [{ cellValue: '=FACTDOUBLE(288)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(3840)
    expect(engine.getCellValue(adr('A4')).cellValue as number / 1.23775688540895e+293).toBeCloseTo(1, 6)
  })

  it('rounds argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE(0.9)' }],
      [{ cellValue: '=FACTDOUBLE(1.1)' }],
      [{ cellValue: '=FACTDOUBLE(10.42)' }],
      [{ cellValue: '=FACTDOUBLE(287.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(3840)
    expect(engine.getCellValue(adr('A4')).cellValue as number / 5.81436347598024e+291).toBeCloseTo(1, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE(-1)' }],
      [{ cellValue: '=FACTDOUBLE(289)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('uses coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE("0")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FACTDOUBLE(NA())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
