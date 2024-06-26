import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function GEOMEAN', () => {
  it('single number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('two numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(1, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('more numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(8, 1, 2, 4, 16)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('validates input', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(8, 0, 2, 4, 16)' }],
      [{ cellValue: '=GEOMEAN(8, -1, -2, 4, 16)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '9' }, { cellValue: '3' }],
      [{ cellValue: '=GEOMEAN(A1:C1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(3)
  })

  it('propagates error from regular argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=3/0' }, { cellValue: '=GEOMEAN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('propagates first error from range argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=3/0' }, { cellValue: '=FOO(' }, { cellValue: '=GEOMEAN(A1:B1)' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('returns error for empty ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(A2:A3)' }],
      [{ cellValue: null }],
      [{ cellValue: null }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.OneValue))
  })

  /**
   * product #1 does not coerce the input
   */
  it('does coercions of nonnumeric explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(TRUE(),"4")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('ignores nonnumeric values in ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GEOMEAN(A2:D2)' }],
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: false }, { cellValue: null }, { cellValue: '\'0' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })
})
