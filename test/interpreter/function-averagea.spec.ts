import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('AVERAGEA', () => {
  it('AVERAGEA with empty args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=AVERAGEA()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('AVERAGEA with args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGEA(1, B1)' }, { cellValue: '4' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2.5)
  })

  it('AVERAGEA with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '4' }],
      [{ cellValue: '=AVERAGEA(A1:A3)' }]
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(2.333333333)
  })

  it('AVERAGEA converts non-blank values to numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '39' }, { cellValue: '="1"' }, { cellValue: '=AVERAGEA(A1:B1)' }],
      [{ cellValue: '39' }, { cellValue: '=TRUE()' }, { cellValue: '=AVERAGEA(A2:B2)' }],
      [{ cellValue: '39' }, { cellValue: null }, { cellValue: '=AVERAGEA(A3:B3)' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(19.5)
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(20)
    expect(engine.getCellValue(adr('C3')).cellValue).toEqual(39)
  })

  it('error when no meaningful arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: 'foo' }],
      [{ cellValue: null }, { cellValue: null }],
      [{ cellValue: '=AVERAGEA(A1:A2)' }, { cellValue: '=AVERAGEA(B1:B2)' }]
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=AVERAGEA(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(13.5)
  })

  it('does propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=AVERAGEA(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
