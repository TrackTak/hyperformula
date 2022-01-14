import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('MAXA', () => {
  it('MAXA with empty args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MAXA()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('MAXA with args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MAXA(1, B1)' }, { cellValue: '3.14' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(3.14)
  })

  it('MAXA with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=MAXA(A1:A3)' }]]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('does only boolean coercions', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="42"' }, { cellValue: '=MAXA(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=MAXA(A2)' }],
      [{ cellValue: '=FALSE()' }, { cellValue: '=MAXA(A3)' }],
      [{ cellValue: '="TRUE"' }, { cellValue: '=MAXA(A4)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual(0)
  })

  it('MAXA of strings and -1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }], [{ cellValue: 'bar' }], [{ cellValue: '-1' }], [{ cellValue: '=MAXA(A1:A3)' }]]})
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
  })

  it('MAXA of empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '' }, { cellValue: '=MAXA(A1)' }]]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('MAXA of empty value and some negative number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '' }, { cellValue: '-1' }, { cellValue: '=MAXA(A1,B1)' }],
      [{ cellValue: null }, { cellValue: '-1' }, { cellValue: '=MAXA(A2,B2)' }],
    ]})
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(-1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MAXA(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(22)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=MAXA(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
