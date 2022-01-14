import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SERIESSUM', () => {
  it('checks required number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(1,2,3)' }],
      [{ cellValue: '=SERIESSUM(1,2,3,4,5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('computes correct answer', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(2,3,4,A2:D2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(137480)
  })

  it('ignores nulls', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(2,3,4,A2:D2)' }],
      [{ cellValue: 1 }, { cellValue: null }, { cellValue: 3 }, { cellValue: 4}]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(8584)
  })

  it('throws error for non-numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(2,3,4,A2:D2)' }],
      [{ cellValue: 1}, { cellValue: '\'1'}, { cellValue: 3}, { cellValue: 4 }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })

  it('works for non-integer args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(2,3.1,4,A3:D3)' }],
      [{ cellValue: '=SERIESSUM(2,3,4.1,A3:D3)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(147347.41562949, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(168708.537245456, 6)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SERIESSUM(2,3,4,A2:D2)' }],
      [{ cellValue: 1 }, { cellValue: '=NA()' }, { cellValue: 3 }, { cellValue: 4}]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
