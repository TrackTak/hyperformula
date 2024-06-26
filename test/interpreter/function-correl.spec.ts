import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('CORREL', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CORREL(B1:B5)' }],
      [{ cellValue: '=CORREL(B1:B5, C1:C5, D1:D5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('ranges need to have same amount of elements', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CORREL(B1:B5, C1:C6)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EqualLength))
  })

  it('works (simple)', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '2' }, { cellValue: '20' }],
      [{ cellValue: '=CORREL(A1:A2, B1:B2)' }]
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toBe(1)
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '2' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '3' }],
      [{ cellValue: '7' }, { cellValue: '6' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '8' }, { cellValue: '5' }],
      [{ cellValue: '=CORREL(A1:A5, B1:B5)' }]
    ]})

    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(0.7927032095)
  })

  it('error when not enough data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=CORREL(A1:A1, B1:B1)' }],
      [{ cellValue: '=CORREL(42, 43)' }],
      [{ cellValue: '=CORREL("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
  })

  it('doesnt do coercions, nonnumeric values are skipped', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '="2"' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=CORREL(A1:A3, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=CORREL(MMULT(A1:B2, A1:B2), MMULT(B1:C2, B1:C2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.999248091927219, 6)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=4/0' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=CORREL(A1:A3, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
