import {ErrorType, ExportedCellChange, HyperFormula, InvalidAddressError, NoSheetWithIdError} from '../../src'
import {AbsoluteCellRange} from '../../src/AbsoluteCellRange'
import {ArraySize} from '../../src/ArraySize'
import {simpleCellAddress} from '../../src/Cell'
import {Config} from '../../src/Config'
import {ArrayVertex, EmptyCellVertex, ValueCellVertex} from '../../src/DependencyGraph'
import {ErrorMessage} from '../../src/error-message'
import {SheetSizeLimitExceededError} from '../../src/errors'
import { CellData } from '../../src/interpreter/InterpreterValue'
import {ColumnIndex} from '../../src/Lookup/ColumnIndex'
import {
  adr,
  colEnd,
  colStart,
  detailedError,
  expectArrayWithSameContent,
  expectEngineToBeTheSameAs,
  expectVerticesOfTypes,
  noSpace,
  rowEnd,
  rowStart
} from '../testUtils'

describe('Changing cell content - checking if its possible', () => {
  it('address should have valid coordinates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(engine.isItPossibleToSetCellContents(simpleCellAddress(0, -1, 0))).toEqual(false)
  })

  it('address should be in existing sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(engine.isItPossibleToSetCellContents(adr('A1', 1))).toEqual(false)
  })

  it('yes if there is an array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=TRANSPOSE(A1:B2)' }],
      [],
      [{ cellValue: '13' }],
    ]})

    expect(engine.isItPossibleToSetCellContents(adr('A3'))).toBe(true)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(adr('A3'), 1, 1))).toBe(true)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(adr('A1'), 2, 2))).toBe(true)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(adr('A2'), 2, 2))).toBe(true)
  })

  it('no if content exceeds sheet size limits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    const cellInLastColumn = simpleCellAddress(0, Config.defaultConfig.maxColumns - 1, 0)
    const cellInLastRow = simpleCellAddress(0, 0, Config.defaultConfig.maxRows - 1)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(cellInLastColumn, 1, 1))).toEqual(true)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(cellInLastColumn, 2, 1))).toEqual(false)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(cellInLastRow, 1, 1))).toEqual(true)
    expect(engine.isItPossibleToSetCellContents(AbsoluteCellRange.spanFrom(cellInLastRow, 1, 2))).toEqual(false)
  })

  it('yes otherwise', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    expect(engine.isItPossibleToSetCellContents(adr('A1'))).toEqual(true)
  })
})

describe('changing cell content', () => {
  it('update formula vertex', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    let c1 = engine.addressMapping.fetchCell(adr('C1'))

    expect(engine.graph.existsEdge(a1, c1)).toBe(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(1)

    engine.setCellContents(adr('C1'), [[{ cellValue: '=B1' }]])

    c1 = engine.addressMapping.fetchCell(adr('C1'))
    expect(engine.graph.existsEdge(a1, c1)).toBe(false)
    expect(engine.graph.existsEdge(b1, c1)).toBe(true)

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(2)
  })

  it('update formula to number cell vertex', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    engine.setCellContents(adr('B1'), [[{ cellValue: '7', metadata: {test: 'value'} }]])
    expect(engine.getCellValue(adr('B1'))).toEqual(new CellData(7, { test: 'value'}))
    expect(engine.graph.existsEdge(a1, b1)).toBe(false)
  })

  it('update formula to metadata cell vertex', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    engine.setCellContents(adr('B1'), [[{ cellValue: null, metadata: {test: 'value'} }]])
    engine.setCellContents(adr('A1'), [[{ metadata: {test: 'value'} }]])

    expect(engine.getCellValue(adr('B1'))).toEqual(new CellData(null, { test: 'value'}))
    expect(engine.getCellValue(adr('A1'))).toEqual(new CellData(1, { test: 'value'}))
    expect(engine.graph.existsEdge(a1, b1)).toBe(false)
  })

  it('update formula to plain text cell vertex', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    engine.setCellContents(adr('B1'), [[{ cellValue: 'foo' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toBe('foo')
    expect(engine.graph.existsEdge(a1, b1)).toBe(false)
  })

  it('set vertex with edge to empty cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]})

    engine.setCellContents(adr('A1'), [[{ cellValue: null }]])

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const a2 = engine.addressMapping.fetchCell(adr('B1'))
    expect(a1).toBeInstanceOf(EmptyCellVertex)
    expect(engine.graph.existsEdge(a1, a2)).toBe(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(null)
  })

  it('update formula to empty cell', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    engine.setCellContents(adr('B1'), [[{ cellValue: null }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(null)
    expect(engine.graph.nodes).not.toContain(b1)
    expect(engine.graph.existsEdge(a1, b1)).toBe(false)
  })

  it('update value cell to formula', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    let b1 = engine.addressMapping.fetchCell(adr('B1'))

    expect(engine.graph.existsEdge(a1, b1)).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(2)
    engine.setCellContents(adr('B1'), [[{ cellValue: '=A1' }]])

    b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('update value cell to value cell', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(2)
    engine.setCellContents(adr('B1'), [[{ cellValue: '3' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(3)
  })

  it('update value cell to value cell with the same value', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=SUM(A1:B1)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const b1 = engine.addressMapping.getCell(adr('B1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b1setCellValueSpy = spyOn(b1 as any, 'setCellValue')
    const c1 = engine.addressMapping.getCell(adr('C1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c1setCellValueSpy = spyOn(c1 as any, 'setCellValue')

    engine.setCellContents(adr('B1'), [[{ cellValue: '2' }]])

    expect(b1setCellValueSpy).not.toHaveBeenCalled()
    expect(c1setCellValueSpy).toHaveBeenCalled()
  })

  it('update value cell to value cell with the same value with metadata', () => {
    const sheet = [
      [{ cellValue: '1' }, {cellValue: '2', metadata: {test: 'value'} }, { cellValue: '=SUM(A1:B1)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const b1 = engine.addressMapping.getCell(adr('B1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b1setCellValueSpy = spyOn(b1 as any, 'setCellValue')
    const c1 = engine.addressMapping.getCell(adr('C1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c1setCellValueSpy = spyOn(c1 as any, 'setCellValue')

    engine.setCellContents(adr('B1'), [[{cellValue: '2', metadata: {test: 'value'} }]])

    expect(b1setCellValueSpy).not.toHaveBeenCalled()
    expect(c1setCellValueSpy).toHaveBeenCalled()
  })

  it('update value cell to empty', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(2)
    engine.setCellContents(adr('B1'), { cellValue: null })
    expect(engine.addressMapping.getCell(adr('B1'))).toBe(undefined)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(null)
  })

  it('update value cell to error literal', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }]
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '#DIV/0!' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('update value cell to error-like literal', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }]
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '#FOO!' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('#FOO!')
  })

  it('update value cell to invalid formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }]]})

    engine.setCellContents(adr('A1'), { cellValue: '=SUM(' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=SUM(')
  })

  it('changing value inside range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }],
      [{ cellValue: '2' }, { cellValue: '0' }],
      [{ cellValue: '3' }, { cellValue: '=SUM(A1:A3)' }],
    ]})
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(6)

    engine.setCellContents({sheet: 0, col: 0, row: 0}, { cellValue: '3' })
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(8)
  })

  it('changing value inside column range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }],
      [{ cellValue: '2' }, { cellValue: '0' }],
      [{ cellValue: '3' }, { cellValue: '0' }, { cellValue: '=SUM(A:B)' }],
    ]})
    expect(engine.getCellValue(adr('C3')).cellValue).toEqual(6)

    engine.setCellContents({sheet: 0, col: 1, row: 0}, { cellValue: '3' })
    expect(engine.getCellValue(adr('C3')).cellValue).toEqual(9)
  })

  it('changing value inside row range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }],
      [{ cellValue: '2' }, { cellValue: '0' }],
      [{ cellValue: '=SUM(1:2)' }],
    ]})
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)

    engine.setCellContents({sheet: 0, col: 1, row: 0}, { cellValue: '3' })
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(6)
  })

  it('set formula for the first time', () => {
    const sheet = [
      [{ cellValue: '42' }, { cellValue: '' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), { cellValue: '=A1' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(42)
  })

  it('set nothing again', () => {
    const sheet = [
      [{ cellValue: null }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: null })
    const a1 = engine.addressMapping.getCell(adr('A1'))
    expect(a1).toBe(undefined)
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(null)
  })

  it('set number for the first time', () => {
    const sheet = [
      [{ cellValue: null }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: '7' })

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(7)
  })

  it('set text for the first time', () => {
    const sheet = [
      [{ cellValue: null }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: 'foo' })

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('foo')
  })

  it('change empty to formula', () => {
    const sheet = [
      [{ cellValue: '42' }, { cellValue: null }, { cellValue: '=B1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), { cellValue: '=A1' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const c1 = engine.addressMapping.fetchCell(adr('C1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.graph.existsEdge(b1, c1)).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(42)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(42)
  })

  it('set nothing again', () => {
    const sheet = [
      [{ cellValue: null }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: null })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(a1).toBeInstanceOf(EmptyCellVertex)
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
  })

  it('change EMPTY to NUMBER', () => {
    const sheet = [
      [{ cellValue: null }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: '7' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(7)
  })

  it('change EMPTY to TEXT', () => {
    const sheet = [
      [{ cellValue: null }, { cellValue: '=A1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: 'foo' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toBe('foo')
  })

  it('ensure that only part of the tree is evaluated', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=A1' }, { cellValue: '=B1' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    const a2 = engine.addressMapping.getCell(adr('A2'))
    const b2 = engine.addressMapping.getCell(adr('B2'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a2setCellValueSpy = spyOn(a2 as any, 'setCellValue')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b2setCellValueSpy = spyOn(b2 as any, 'setCellValue')

    engine.setCellContents(adr('A1'), { cellValue: '3' })
    expect(a2setCellValueSpy).toHaveBeenCalled()
    expect(b2setCellValueSpy).not.toHaveBeenCalled()
  })

  it('is not possible to set cell content in sheet which does not exist', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    expect(() => {
      engine.setCellContents(adr('B1', 1), { cellValue: '3' })
    }).toThrow(new NoSheetWithIdError(1))
  })

  it('is not possible to set cell content with invalid address', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const address = {row: -1, col: 0, sheet: 0}
    expect(() => {
      engine.setCellContents(address, {cellValue: '3'})
    }).toThrow(new InvalidAddressError(address))
  })

  it('remembers if the new formula is structure dependent', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '1' }],
    ]})

    engine.setCellContents(adr('C1'), { cellValue: '=COLUMNS(A1:B1)' })
    const c1 = engine.addressMapping.getCell(adr('C1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c1setCellValueSpy = spyOn(c1 as any, 'setCellValue')
    engine.removeRows(0, [1, 1])

    expect(c1setCellValueSpy).toHaveBeenCalled()
  })

  it('returns cell value change', () => {
    const sheet = [
      [{ cellValue: '1' }],
    ]

    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), { cellValue: '2' })

    expect(changes.length).toBe(1)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A1'), 2))
  })

  it('returns cell data change if has metadata', () => {
    const sheet = [
      [{ cellValue: '1' }],
    ]

    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), { cellValue: '2', metadata: { test: 'value'}})

    expect(changes.length).toBe(1)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A1'), 2))
  })

  it('returns cell value change if has no metadata', () => {
    const sheet = [
      [{ cellValue: '1' }],
    ]

    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), { cellValue: '2' })

    expect(changes.length).toBe(1)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A1'), 2))
  })

  it('returns dependent formula value change', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=A1' }],
    ]

    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), { cellValue: '2' })

    expect(changes.length).toBe(2)
    expect(changes[0]).toMatchObject(new ExportedCellChange(adr('A1'), 2))
    expect(changes[1]).toMatchObject(new ExportedCellChange(adr('B1'), 2))
  })

  it('returns dependent matrix value changes', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MMULT(A1:B2,A1:B2)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), { cellValue: '2' })

    expect(changes.length).toBe(5)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [2, 10, 12, 18, 22])
  })

  it('update empty cell to parsing error ', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })

    engine.setCellContents(adr('A1'), { cellValue: '=SUM(' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('update dependecy value cell to parsing error ', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=SUM(A1)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), { cellValue: '=SUM(' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('update formula cell to parsing error ', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=SUM(A1)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), { cellValue: '=SUM(' })

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(a1, b1)).toBe(false)

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('update parsing error to formula', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '=SUM(' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), { cellValue: '=SUM(A1)' })

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
  })

  it('update empty cell to unparsable matrix formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })

    engine.setCellContents(adr('A1'), { cellValue: '=TRANSPOSE(' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=TRANSPOSE(')
  })

  it('should throw when trying to set cell content outside sheet limits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    const cellInLastColumn = simpleCellAddress(0, Config.defaultConfig.maxColumns, 0)
    const cellInLastRow = simpleCellAddress(0, 0, Config.defaultConfig.maxRows)

    expect(() => engine.setCellContents(cellInLastColumn, { cellValue: '1' })).toThrow(new SheetSizeLimitExceededError())
    expect(() => engine.setCellContents(cellInLastRow, { cellValue: '1' })).toThrow(new SheetSizeLimitExceededError())
  })

  it('setting empty cells outside sheet limits does not produce error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    const cellInLastColumn = simpleCellAddress(0, Config.defaultConfig.maxColumns, 0)
    const cellInLastRow = simpleCellAddress(0, 0, Config.defaultConfig.maxRows)

    expect(() => engine.setCellContents(cellInLastColumn, { cellValue: null })).not.toThrow()
    expect(() => engine.setCellContents(cellInLastRow, { cellValue: null })).not.toThrow()
  })

  it('should set matrix with range out of current sheet scope', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    engine.setCellContents(adr('C1'), { cellValue: '=MMULT(A1:B2,A1:B2)' })
  })
})

describe('change multiple cells contents', () => {
  it('works for one', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), [[{ cellValue: '3' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(3)
  })

  it('works for many', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('B1'), [
      [{ cellValue: '12' }, { cellValue: '13' }],
      [{ cellValue: '15' }, { cellValue: '16' }],
      [{ cellValue: '18' }, { cellValue: '19' }],
    ])
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(12)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(13)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(15)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(16)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(18)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(19)
  })

  it('recompute only once', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evaluatorCallSpy = spyOn(engine.evaluator as any, 'partialRun')

    engine.setCellContents(adr('B1'), [
      [{ cellValue: '12' }, { cellValue: '13' }],
      [{ cellValue: '15' }, { cellValue: '16' }],
      [{ cellValue: '18' }, { cellValue: '19' }],
    ])

    expect(evaluatorCallSpy).toHaveBeenCalledTimes(1)
  })

  it('possible to change matrices', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    engine.setCellContents(adr('A1'), [[{ cellValue: '42' }, { cellValue: '18' }, { cellValue: '=MMULT(A1:B1,TRANSPOSE(A1:B1))' }]])
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(42)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(18)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(2088)
  })

  it('returns changes of multiple values', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '7' }, { cellValue: '8' }], [{ cellValue: '7' }, { cellValue: '8' }]])

    expect(changes.length).toEqual(4)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [7, 8, 9, 10])
  })

  it('returns changes of multiple values dependent formulas', () => {
    const sheet = [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=SUM(A1:B1)' }, { cellValue: '=SUM(B1:B2)' }],
    ]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '7' }, { cellValue: '8' }], [{ cellValue: '9' }, { cellValue: '10' }]])

    expect(changes.length).toEqual(6)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [7, 8, 9, 10, 15, 18])
  })

  it('should throw when trying to set cell contents outside sheet limits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    const cellInLastColumn = simpleCellAddress(0, Config.defaultConfig.maxColumns - 1, 0)
    const cellInLastRow = simpleCellAddress(0, 0, Config.defaultConfig.maxRows - 1)

    expect(() => engine.setCellContents(cellInLastColumn, [[{ cellValue: '1' }, { cellValue: '2' }]])).toThrow(new SheetSizeLimitExceededError())
    expect(() => engine.setCellContents(cellInLastRow, [[{ cellValue: '1' }], [{ cellValue: '1' }]])).toThrow(new SheetSizeLimitExceededError())
  })
})

describe('updating column index', () => {
  it('should update column index when changing simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '15' }],
    ] }, {useColumnIndex: true})

    engine.setCellContents(adr('B2'), { cellValue: '8' })

    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 15).index, [])
    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 8).index, [1])
  })

  it('should update column index when clearing cell content', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ] }, {useColumnIndex: true})

    engine.setCellContents(adr('B1'), { cellValue: null })

    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 2).index, [])
  })

  it('should update column index when changing to ParsingError', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ] }, {useColumnIndex: true})

    engine.setCellContents(adr('B1'), { cellValue: '=SUM(' })

    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 2).index, [])
  })

  it('should update column index when changing to formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
    ] }, {useColumnIndex: true})

    engine.setCellContents(adr('B1'), { cellValue: '=SUM(A1)' })

    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 2).index, [])
    expectArrayWithSameContent((engine.columnSearch as ColumnIndex).getValueIndex(0, 1, 1).index, [0])
  })
})

describe('column ranges', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=SUM(A:B)' }]
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '3' })

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(5)
  })

  it('works when new content is added beyond previous sheet size', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=SUM(A:B)' }]
    ]})

    engine.setCellContents(adr('A2'), { cellValue: '3' })

    const range = engine.rangeMapping.fetchRange(colStart('A'), colEnd('B'))
    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    expect(engine.graph.existsEdge(a2, range)).toEqual(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(6)
  })

  it('works when adding matrix', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(B:C)' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
    ]})

    engine.setCellContents(adr('B1'), { cellValue: '=TRANSPOSE(A2:A3)' })

    const range = engine.rangeMapping.fetchRange(colStart('B'), colEnd('C'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const c1 = engine.addressMapping.fetchCell(adr('C1'))
    expect(engine.graph.existsEdge(b1, range)).toEqual(true)
    expect(engine.graph.existsEdge(c1, range)).toEqual(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })
})

describe('row ranges', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=SUM(1:2)' }]
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '3' })

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(5)
  })

  it('works when new content is added beyond previous sheet size', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=SUM(1:2)' }]
    ]})

    engine.setCellContents(adr('B1'), { cellValue: '3' })

    const range = engine.rangeMapping.fetchRange(rowStart(1), rowEnd(2))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    expect(engine.graph.existsEdge(b1, range)).toEqual(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(6)
  })

  it('works when adding matrix', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(2:3)' }, { cellValue: '1' }, { cellValue: '2' }],
    ]})

    engine.setCellContents(adr('A2'), { cellValue: '=TRANSPOSE(B1:C1)' })

    const range = engine.rangeMapping.fetchRange(rowStart(2), rowEnd(3))
    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    const a3 = engine.addressMapping.fetchCell(adr('A3'))
    expect(engine.graph.existsEdge(a2, range)).toEqual(true)
    expect(engine.graph.existsEdge(a3, range)).toEqual(true)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })
})

describe('arrays', () => {
  it('should set array to cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('C1'), [[{ cellValue: '=-A1:B2' }]])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=-A1:B2' }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should be REF array if no space for result', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [{ cellValue: 1 }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A1'), [[{ cellValue: '=-B2:B3' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(noSpace())
    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-B2:B3' }],
      [{ cellValue: 1 }],
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should be REF array if no space and potential cycle', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [{ cellValue: 1 }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A1'), [[{ cellValue: '=-A2:A3' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(noSpace())
    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-A2:A3' }],
      [{ cellValue: 1 }],
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should shrink to one vertex if there is more content colliding with array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A1'), [
      [{ cellValue: '=-C1:D2' }],
      [{ cellValue: 1 }]
    ])

    expect(engine.arrayMapping.getArrayByCorner(adr('A1'))?.array.size).toEqual(ArraySize.error())
    expectVerticesOfTypes(engine, [
      [ArrayVertex, undefined],
      [ValueCellVertex, undefined],
    ])
    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: null }]
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should be separate arrays', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A1'), [
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
    ])

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, undefined],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [undefined, ArrayVertex, ArrayVertex],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(4)
    expect(engine.getSheetValues(0).cells)
  })

  it('should REF last array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: null }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A1'), [
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }],
    ])

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [undefined,  undefined],
    ])
    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: noSpace() }, { cellValue:1}, { cellValue:1}, { cellValue:1}, { cellValue:2}],
      [{ cellValue:noSpace()}, { cellValue:2}, { cellValue:2}, { cellValue:1}, { cellValue:2}],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(3)
    expect(engine.getSheetValues(0).cells)
  })

  it('should make existing array REF and change cell content to simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B4'), [[{ cellValue: 'foo' }]])

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: 'foo' }],
      [{  cellValue: noSpace() }],
      [{ cellValue: null }, { cellValue: 'foo' }]
    ])
  })

  it('should not change cell to empty if part of an array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B4'), [[{ cellValue: null }]])

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue:3}, { cellValue:4}, { cellValue: -4}],
      [{ cellValue:-1}, { cellValue:-2}],
      [{ cellValue:-3}, { cellValue:-4}],
    ])
  })

  it('should make existing array REF and change cell content to formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B4'), [[{ cellValue: '=SUM(A1:B2)' }]])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
      [{ cellValue: undefined }, { cellValue: '=SUM(A1:B2)' }]
    ] }, {useArrayArithmetic: true})[0])
    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: 10 }],
      [{ cellValue: noSpace() }],
      [{ cellValue: null }, { cellValue: 10 }]
    ])
  })

  it('should make existing array REF and change cell content to parsing error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B4'), [[{ cellValue: '=SUM(' }]])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
      [{ cellValue: null }, { cellValue: '=SUM(' }]
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should make existing matrix REF and set new array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B3'), [[{ cellValue: '=+A1:B2' }]])

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: 3 }],
      [{ cellValue: noSpace() }, { cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: 4 }]
    ])
  })

  it('should replace one array with another', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=-A1:B2' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('A3'), [[{ cellValue: '=2*A1:B2' }]])

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
      [{ cellValue: 2 }, { cellValue: 4 }],
      [{ cellValue: 6 }, { cellValue: 8 }],
    ])
  })

  it('should adjust dependent formulas after shrinking array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}, {cellValue: null }, { cellValue: null }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(E1, F1:G1)' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('E1'), [[{ cellValue: 'foo' }]])
    engine.setCellContents(adr('D1'), [[{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }, { cellValue: 6 }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(E1, F1:G1)' }]
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should adjust dependent ranges after shrinking array taking smaller vertices into account', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: '=-A1:A3' }, { cellValue: '=SUM(B1:B2)' }, { cellValue: '=SUM(B1:B3)'}],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('B1'), { cellValue: 'foo' })
    engine.setCellContents(adr('B1'), [[{ cellValue: 4 }], [{ cellValue: 5 }], [{ cellValue: 6 }]])

    const b1 = engine.dependencyGraph.getCell(adr('b1'))!
    const b2 = engine.dependencyGraph.getCell(adr('b2'))!
    const b3 = engine.dependencyGraph.getCell(adr('b3'))!
    const b1b2 = engine.rangeMapping.getRange(adr('b1'), adr('b2'))!
    const b1b3 = engine.rangeMapping.getRange(adr('b1'), adr('b3'))!

    expect(engine.graph.existsEdge(b1, b1b2)).toBe(true)
    expect(engine.graph.existsEdge(b2, b1b2)).toBe(true)
    expect(engine.graph.existsEdge(b1b2, b1b3)).toBe(true)
    expect(engine.graph.existsEdge(b1, b1b3)).toBe(false)
    expect(engine.graph.existsEdge(b2, b1b3)).toBe(false)
    expect(engine.graph.existsEdge(b3, b1b3)).toBe(true)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 4 }, { cellValue: '=SUM(B1:B2)' }, { cellValue: '=SUM(B1:B3)'}],
      [{ cellValue: 2 }, { cellValue: 5 }],
      [{ cellValue: 3 }, { cellValue: 6 }],
    ] }, {useArrayArithmetic: true})[0])
  })

  it('should return values of a range in changes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }]] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('A2'), [[{ cellValue: '=-A1:B1' }]])

    expect(changes.length).toEqual(2)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), -1))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), -2))
  })

  it('should return changed content when replacing array left corner', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=-A1:B1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('A2'), [[{ cellValue: 'foo' }]])

    expect(changes.length).toEqual(2)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), 'foo'))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), null))
  })

  it('should return changed content when replacing any array cell with simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=-A1:C1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('B2'), [[{ cellValue: 'foo' }]])

    expect(changes.length).toEqual(3)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), noSpace()))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), 'foo'))
    expect(changes).toContainEqual(new ExportedCellChange(adr('C2'), null))
  })

  it('should return changed content when replacing any array cell with parsing error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=-A1:C1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('B2'), [[{ cellValue: '=SUM(' }]])

    expect(changes.length).toEqual(3)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), noSpace()))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), detailedError(ErrorType.ERROR, ErrorMessage.ParseError)))
    expect(changes).toContainEqual(new ExportedCellChange(adr('C2'), null))
  })

  it('should return changed content when clearing array left corner', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=-A1:B1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('A2'), { cellValue: null })

    expect(changes.length).toEqual(2)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), null))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), null))
  })

  it('should return no changes when trying to clear array cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=-A1:B1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('B2'), { cellValue: null })

    expect(changes.length).toEqual(0)
  })

  it('should return changed content when replacing array to another smaller one', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=-A1:C1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('A2'), [[{ cellValue: '=+A1:B1' }]])

    expect(changes.length).toEqual(3)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), 1))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), 2))
    expect(changes).toContainEqual(new ExportedCellChange(adr('C2'), null))
  })

  it('should return changed content when replacing array to smaller one even if values are same', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=-A1:C1' }],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('A2'), [[{ cellValue: '=-A1:B1' }]])

    expect(changes.length).toEqual(3)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), -1))
    expect(changes).toContainEqual(new ExportedCellChange(adr('B2'), -2))
    expect(changes).toContainEqual(new ExportedCellChange(adr('C2'), null))
  })

  it('should return REF in changes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}],
    ] }, {useArrayArithmetic: true})

    const [changes] = engine.setCellContents(adr('E1'), [[{ cellValue: 'foo' }]])

    expect(changes).toContainEqual(new ExportedCellChange(adr('D1'), noSpace()))
    expect(changes).toContainEqual(new ExportedCellChange(adr('E1'), 'foo'))
    expect(changes).toContainEqual(new ExportedCellChange(adr('F1'), null))
  })

  it('should undo REF', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}, {cellValue: null }, { cellValue: null }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(F1:F1)' }, { cellValue: '=SUM(F1:G1)'}],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('E1'), [[{ cellValue: 'foo' }]])
    engine.setCellContents(adr('D1'), [[{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    engine.undo()
    engine.undo()

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}, {cellValue: null }, { cellValue: null }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(F1:F1)' }, { cellValue: '=SUM(F1:G1)'}],
    ] }, {useArrayArithmetic: true})[0])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-1)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(-2)
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(-3)
    expect(engine.getCellValue(adr('D2')).cellValue).toEqual(1)
  })

  it('should redo REF', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}, {cellValue: null }, { cellValue: null }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(F1:F1)' }, { cellValue: '=SUM(F1:G1)'}],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('E1'), [[{ cellValue: 'foo' }]])
    engine.undo()
    engine.redo()

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=-A1:C1'}, {cellValue: 'foo' }, { cellValue: null }, { cellValue: 4 }],
      [{ cellValue: '=D1' }, { cellValue: '=E1' }, { cellValue: '=SUM(F1:F1)' }, { cellValue: '=SUM(F1:G1)'}],
    ] }, {useArrayArithmetic: true})[0])
  })

  xit('should recalculate matrix if space is available', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=+C1:D1' }, { cellValue: 'foo' }, { cellValue: 1 }, { cellValue: 2}]
    ] }, {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(noSpace())

    engine.setCellContents(adr('B1'), { cellValue: null })

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 1 }, { cellValue: 2}]
    ])
  })
})
