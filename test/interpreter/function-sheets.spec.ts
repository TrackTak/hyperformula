import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SHEETS', () => {
  it('should return number of sheets if no argument provided', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': { cells: [[{ cellValue: '=SHEETS()' }]]},
      'Sheet2': { cells: [] },
    })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('should return 1 for a valid reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SHEETS(B1)' }, { cellValue: '=SHEETS(A1:A2)' }, { cellValue: '=SHEETS(A:B)' }, { cellValue: '=SHEETS(1:2)'}]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(1)
  })

  it('should return VALUE for non-reference parameter', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SHEETS(1)' }, { cellValue: '=SHEETS("foo")' }, { cellValue: '=SHEETS(TRUE())' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CellRefExpected))
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SHEETS(1/0)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should work for itself', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SHEETS(A1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })
})
