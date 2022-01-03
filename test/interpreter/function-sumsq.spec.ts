import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('SUMSQ', () => {
  it('SUMSQ without args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SUMSQ()' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('SUMSQ with args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMSQ(1, B1)' }, { cellValue: '2' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(5)
  })

  it('SUMSQ with range args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=SUMSQ(A1:B2)' }],
    ])
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(30)
  })

  it('SUMSQ with using previously cached value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '3' }, { cellValue: '=SUMSQ(A1:A1)' }],
      [{ cellValue: '4' }, { cellValue: '=SUMSQ(A1:A2)' }],
    ])
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(25)
  })

  it('doesnt do coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: '=TRUE()' }],
      [{ cellValue: '=CONCATENATE("1","0")' }],
      [{ cellValue: '=SUMSQ(A1:A5)' }],
    ])

    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(5)
  })

  it('range only with empty value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '' }, { cellValue: '=SUMSQ(A1:A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('range only with some empty values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '42' }, { cellValue: '' }, { cellValue: '13' }, { cellValue: '=SUMSQ(A1:C1)'}],
    ])

    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(1933)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=SUMSQ(MMULT(A1:B2, A1:B2))' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(858)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=SUMSQ(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
