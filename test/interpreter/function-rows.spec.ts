import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ROWS', () => {
  it('accepts exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS()' }, { cellValue: '=ROWS(A2:A3, B2:B4)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS(A1:C2)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('works for row range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS(1:3)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('works for column range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS(A:C)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(engine.getConfig().maxRows)
  })

  it('works for array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS({1;2;3})' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('works with cell reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ROWS(A1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('propagates only direct errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=ROWS(4/0)' }],
      [{ cellValue: '=ROWS(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  // Inconsistency with Product 1
  it('works with formulas', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '=ROWS(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })

  it('should work when adding column', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=ROWS(A1:A2)' }],
      [{ cellValue: '1' }],
    ]})

    engine.addRows(0, [1, 1])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
  })
})
