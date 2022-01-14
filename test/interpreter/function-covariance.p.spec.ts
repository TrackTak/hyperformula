import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('COVARIANCE.P', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COVARIANCE.P(B1:B5)' }],
      [{ cellValue: '=COVARIANCE.P(B1:B5, C1:C5, D1:D5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('ranges need to have same amount of elements', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COVARIANCE.P(B1:B5, C1:C6)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EqualLength))
  })

  it('works (simple)', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '2' }, { cellValue: '20' }],
      [{ cellValue: '=COVARIANCE.P(A1:A2, B1:B2)' }]
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2.5)
  })

  it('error when not enough data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COVARIANCE.P(A2:A2, A2:A2)' }],
      [{ cellValue: null }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.OneValue))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '2' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '3' }],
      [{ cellValue: '7' }, { cellValue: '6' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '8' }, { cellValue: '5' }],
      [{ cellValue: '=COVARIANCE.P(A1:A5, B1:B5)' }],
      [{ cellValue: '=COVARIANCE.P(1,1)' }],
    ]})

    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(3.72)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  it('doesnt do coercions, nonnumeric values are skipped', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '="2"' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=COVARIANCE.P(A1:A3, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(10)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=COVARIANCE.P(MMULT(A1:B2, A1:B2), MMULT(B1:C2, B1:C2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(122.25)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=4/0' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=COVARIANCE.P(A1:A3, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
