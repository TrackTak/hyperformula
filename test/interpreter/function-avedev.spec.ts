import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {adr, detailedError} from '../testUtils'

describe('Function AVEDEV', () => {
  it('single number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('two numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })

  it('more numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(3, 1, 2, 4, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1.2)
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '0' }, { cellValue: '9' }, { cellValue: '0' }],
      [{ cellValue: '=AVEDEV(A1:C1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4)
  })

  it('propagates error from regular argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=3/0' }, { cellValue: '=AVEDEV(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('propagates first error from range argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=3/0' }, { cellValue: '=FOO(' }, { cellValue: '=AVEDEV(A1:B1)' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('returns error for empty ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(A2:A3)' }],
      [{ cellValue: null }],
      [{ cellValue: null }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  /**
   * Product #1 returns 0
   */
  it('does coercions of nonnumeric explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(TRUE(),FALSE(),)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.444444444444444, 6)
  })

  /**
   * Product #2 returns 0.2:
   * average is computed from numbers, but sum of distances to avg is divided by the original range size.
   */
  it('ignores nonnumeric values in ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVEDEV(A2:E2)' }],
      [{ cellValue: 0 }, { cellValue: 1 }, { cellValue: false }, { cellValue: null }, { cellValue: '\'0' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })
})
