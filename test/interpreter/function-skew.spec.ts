import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SKEW', () => {
  it('simple case', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SKEW(1, 2, 4, 8)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.137624367, 6)
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '9' }, { cellValue: '0' }, { cellValue: '10'}],
      [{ cellValue: '=SKEW(A1:D1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.02854996243, 6)
  })

  it('propagates error from regular argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NA()' }, { cellValue: '=SKEW(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  it('propagates first error from range argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NA()' }, { cellValue: '=FOO(' }, { cellValue: '=SKEW(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  /**
   * product #1 does not coerce the input
   */
  it('does coercions of nonnumeric explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SKEW(TRUE(),FALSE(),)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.732050808, 6)
  })

  it('ignores nonnumeric values in ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SKEW(A2:F2)' }],
      [{ cellValue: 1 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: false }, { cellValue: null }, { cellValue: '\'0' }]
    ])


    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.732050808, 6)
  })

  it('validates range size', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SKEW(0,0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.ThreeValues))
  })
})
