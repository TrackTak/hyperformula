import {ErrorType, HyperFormula} from '../src'
import {simpleCellRange} from '../src/AbsoluteCellRange'
import {adr, detailedErrorWithOrigin} from './testUtils'

describe('Address preservation.', () => {
  it('Should work in the basic case.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NA()' }, { cellValue: '=A1' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A1'))
  })

  it('Should work with named expressions.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NAMEDEXPRESSION' }, { cellValue: '=A1' }]
    ]})
    engine.addNamedExpression('NAMEDEXPRESSION', '=NA()')
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'NAMEDEXPRESSION'))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'NAMEDEXPRESSION'))
  })

  it('Should work with operators.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NA()' }, { cellValue: '=NA()' }, { cellValue: '=A1+B1' }]
    ]})
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A1'))
  })

  it('Should work between sheets.', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [[{ cellValue: '=NA()' }]]},
      Sheet2: { cells:  [[{ cellValue: '=sheet1!A1' }]]}
    })
    expect(engine.getCellValue(adr('A1', 0)).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'sheet1!A1'))
    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'sheet1!A1'))
  })

  it('Should work with function calls.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NA()' }, { cellValue: '=DATE(1,1,A1)' }]
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A1'))
  })

  it('Should work with CYCLE.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=B1' }, { cellValue: '=A1' }],
      [{ cellValue: '=A1' }, { cellValue: '=B1' }],
      [{ cellValue: '=A1' }, { cellValue: '=B1' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1'))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1'))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1'))
  })

  it('Should work with CYCLE #2.', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=B1' }, { cellValue: '=A1' }],
      [{ cellValue: '=A1' }],
      [{ cellValue: '=A1' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1'))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1'))
  })

  it('Should work after simple cruds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NA()' }, { cellValue: '=A1' }]
    ]})

    engine.addColumns(0, [0, 1])
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!B1'))

    engine.setCellContents(adr('B1'), { cellValue: '=1/0' })
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.DIV_BY_ZERO, 'Sheet1!B1'))

    engine.moveCells(simpleCellRange(adr('B1'), adr('B1')), adr('C5'))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.DIV_BY_ZERO, 'Sheet1!C5'))
  })
})
