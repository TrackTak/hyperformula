import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FORMULATEXT', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FORMULATEXT()' }],
      [{ cellValue: '=FORMULATEXT(B2, B3)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return N/A for wrong types of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FORMULATEXT(1)' }],
      [{ cellValue: '=FORMULATEXT("foo")' }],
      [{ cellValue: '=FORMULATEXT(SUM(1))' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should propagate expression error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FORMULATEXT(1/0)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return text of a formula evaluating to error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=1/0' }, { cellValue: '=FORMULATEXT(A1)' }]
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('=1/0')
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, 2)' }, { cellValue: '=FORMULATEXT(A1)' }]
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('=SUM(1, 2)')
  })

  it('should return formula of a left corner cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, 2)' }, { cellValue: '=FORMULATEXT(A1:A2)' }]
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('=SUM(1, 2)')
  })

  it('should return REF when ', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, 2)' }]
    ]})
    engine.addSheet('Sheet2')
    engine.setCellContents(adr('B1'), { cellValue: '=FORMULATEXT(Sheet1!A1:Sheet2!A2)' })

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.CellRefExpected))
  })

  it('should work for unparsed formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1,' }, { cellValue: '=FORMULATEXT(A1)' }]
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('=SUM(1,')
  })

  it('should return itself', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FORMULATEXT(A1)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('=FORMULATEXT(A1)')
  })

  it('should be dependent on sheet structure changes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(A2)' }, { cellValue: '=FORMULATEXT(A1)' }],
      [{ cellValue: 1 }]
    ]})

    engine.addRows(0, [1, 1])

    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=SUM(A3)')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('=SUM(A3)')
  })
})
