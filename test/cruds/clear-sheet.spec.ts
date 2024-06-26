import {HyperFormula, NoSheetWithIdError} from '../../src'
import {adr} from '../testUtils'

describe('Clear sheet - checking if its possible', () => {
  it('no if theres no such sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(engine.isItPossibleToClearSheet(1)).toEqual(false)
  })

  it('yes otherwise', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(engine.isItPossibleToClearSheet(0)).toEqual(true)
  })
})

describe('Clear sheet content', () => {
  it('should throw error when trying to clear not existing sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(() => {
      engine.clearSheet(1)
    }).toThrow(new NoSheetWithIdError(1))
  })

  it('should clear sheet content', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: 'foo' }],
    ]})

    engine.clearSheet(0)

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(null)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(null)
  })

  it('should recalculate and return changes', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [
        [{ cellValue: '1' }],
      ]},
      Sheet2: { cells:  [
        [{ cellValue: '=Sheet1!A1' }],
        [{ cellValue: '=SUM(1, Sheet1!A1)' }],
      ]},
    })

    const [changes] = engine.clearSheet(0)

    expect(engine.getCellValue(adr('A1', 1)).cellValue).toBe(null)
    expect(engine.getCellValue(adr('A2', 1)).cellValue).toEqual(1)

    expect(changes.length).toEqual(2)
  })

  it('should clear sheet with matrix', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '=TRANSPOSE(A1:B1)' }],
      ]},
      Sheet2: { cells:  [
        [{ cellValue: '=Sheet1!A2' }],
        [{ cellValue: '=Sheet1!A3' }],
      ]},
    })

    const [changes] = engine.clearSheet(0)

    expect(engine.getCellValue(adr('A1', 1)).cellValue).toBe(null)
    expect(engine.getCellValue(adr('A2', 1)).cellValue).toBe(null)

    expect(changes.length).toEqual(2)
  })

  it('should clear sheet and dont break edge between cells', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [
        [{ cellValue: '1' }],
      ]},
      Sheet2: { cells:  [
        [{ cellValue: '=Sheet1!A1' }],
      ]},
    })

    engine.clearSheet(0)
    engine.setCellContents(adr('A1'), { cellValue: '2' })

    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqual(2)
  })

  it('should clear sheet and dont break edge between cells, case with range', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [
        [{ cellValue: '1' }],
      ]},
      Sheet2: { cells:  [
        [{ cellValue: '=SUM(Sheet1!A1:B1)' }],
      ]},
    })

    // eslint-disable-next-line
    const [changes] = engine.clearSheet(0)

    engine.setCellContents(adr('A1'), { cellValue: '2' })
    engine.setCellContents(adr('B1'), { cellValue: '3' })

    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqual(5)
  })
})
