import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('RSQ', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RSQ(B1:B5)' }],
      [{ cellValue: '=RSQ(B1:B5, C1:C5, D1:D5)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('ranges need to have same amount of elements', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RSQ(B1:B5, C1:C6)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EqualLength))
  })

  it('works (simple)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '2' }, { cellValue: '20' }],
      [{ cellValue: '=RSQ(A1:A2, B1:B2)' }]
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toBe(1)
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '3' }],
      [{ cellValue: '7' }, { cellValue: '6' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '8' }, { cellValue: '5' }],
      [{ cellValue: '=RSQ(A1:A5, B1:B5)' }]
    ])

    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(0.628378378378378)
  })

  it('error when not enough data', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=RSQ(A1:A1, B1:B1)' }],
      [{ cellValue: '=RSQ(42, 43)' }],
      [{ cellValue: '=RSQ("foo", "bar")' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
  })

  it('doesnt do coercions, nonnumeric values are skipped', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '="2"' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=RSQ(A1:A3, B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=RSQ(MMULT(A1:B2, A1:B2), MMULT(B1:C2, B1:C2))' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.998496749220189, 6)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=4/0' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=RSQ(A1:A3, B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
