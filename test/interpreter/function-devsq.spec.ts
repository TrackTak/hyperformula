import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {adr, detailedError} from '../testUtils'

describe('Function DEVSQ', () => {
  it('single number', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('two numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })

  it('more numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(3, 1, 2, 4, 5)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(10)
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '9' }, { cellValue: '0' }],
      [{ cellValue: '=DEVSQ(A1:C1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(54)
  })

  it('propagates error from regular argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3/0' }, { cellValue: '=DEVSQ(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('propagates first error from range argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3/0' }, { cellValue: '=FOO(' }, { cellValue: '=DEVSQ(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  //inconsistency with product #2
  it('returns 0 for empty ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(A2:A3)' }],
      [{ cellValue: null }],
      [{ cellValue: null }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  /**
   * product #1 does not coerce the input
   */
  it('does coercions of nonnumeric explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(TRUE(),FALSE(),)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.666666666666667, 6)
  })

  it('ignores nonnumeric values in ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEVSQ(A2:D2)' }],
      [{ cellValue: 0 }, { cellValue: 1 }, { cellValue: false }, { cellValue: null }, { cellValue: '\'0' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })
})
