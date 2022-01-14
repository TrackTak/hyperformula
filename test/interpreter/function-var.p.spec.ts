import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function VAR.P', () => {
  it('should take at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=VAR.P()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate variance (population)', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=VAR.P(2, 3)' }],
      [{ cellValue: '=VAR.P(1)' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.25)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('should coerce explicit argument to numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=VAR.P(2, 3, 4, TRUE(), FALSE(), "1",)' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.95918367346939, 6) //inconsistency with product #1
  })

  it('should ignore non-numeric values in ranges, including ignoring logical values and text representation of numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=VAR.P(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue: true}, { cellValue: false}, { cellValue: 'a'}, { cellValue: '\'1'}, { cellValue: null}],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.666666666666667, 6)
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=VAR.P(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue:  '=NA()'}, { cellValue: false}, { cellValue:  'a'}, { cellValue:  '\'1' }, { cellValue:  null }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
