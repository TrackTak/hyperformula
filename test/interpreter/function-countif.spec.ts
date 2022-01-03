import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {StatType} from '../../src/statistics'
import {adr, detailedError} from '../testUtils'

describe('Function COUNTIF', () => {
  it('requires 2 arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTIF(B1:B3)' }],
      [{ cellValue: '=COUNTIF(B1:B3, ">0", B1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=COUNTIF(A1:A3, ">=1")' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
  })

  it('works with mixed types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }],
      [{ cellValue: '"1"' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=COUNTIF(A1:A3, "=1")' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
  })

  it('use partial cache', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }, { cellValue: '=COUNTIF(A1:A3, ">=1")' }],
      [{ cellValue: '3' }, { cellValue: '=COUNTIF(A1:A4, ">=1")' }],
    ])

    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual(3)
    expect(engine.getStats().get(StatType.CRITERION_FUNCTION_PARTIAL_CACHE_USED)).toEqual(1)
  })

  it('use full cache', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '=COUNTIF(A1:A3, ">=1")' }],
      [{ cellValue: '1' }, { cellValue: '=COUNTIF(A1:A3, ">=1")' }],
      [{ cellValue: '2' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(2)
    expect(engine.getStats().get(StatType.CRITERION_FUNCTION_FULL_CACHE_USED)).toEqual(1)
  })

  it('works for only one cell', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=COUNTIF(A1, ">=1")' }],
      [{ cellValue: '0' }, { cellValue: '=COUNTIF(A2, ">=1")' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(0)
  })

  it('error when criterion unparsable', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTIF(B1:B2, "><foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.BadCriterion))
  })

  it('scalars are treated like singular arrays', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTIF(10, ">1")' }],
      [{ cellValue: '=COUNTIF(0, ">1")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('error propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTIF(4/0, ">1")' }],
      [{ cellValue: '=COUNTIF(0, 4/0)' }],
      [{ cellValue: '=COUNTIF(4/0, FOOBAR())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works with range values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '3' }, { cellValue: '5' }],
      [{ cellValue: '7' }, { cellValue: '9' }],
      [{ cellValue: '=COUNTIF(A1:B2, ">4")' }],
      [{ cellValue: '=COUNTIF(MMULT(A1:B2, A1:B2), ">50")' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('works for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=TRANSPOSE(A1:B1)' }],
      [],
      [{ cellValue: '=COUNTIF(A2:A3, ">0")' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
  })

  it('ignore errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '1' }],
      [{ cellValue: '=COUNTIF(A1:A3, "=1")' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
  })
})
