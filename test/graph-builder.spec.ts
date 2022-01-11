import {HyperFormula} from '../src'
import {Config} from '../src/Config'
import {EmptyCellVertex, ValueCellVertex} from '../src/DependencyGraph'
import { FormulaVertex } from '../src/DependencyGraph/FormulaCellVertex'
import {SheetSizeLimitExceededError} from '../src/errors'
import AsyncTestPlugin from './helpers/AsyncTestPlugin'
import {adr, colEnd, colStart} from './testUtils'

describe('GraphBuilder', () => {
  it('build sheet with simple number cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '42' }],
    ]})

    const vertex = engine.addressMapping.fetchCell(adr('A1'))
    expect(vertex).toBeInstanceOf(ValueCellVertex)
    expect(vertex.getCellValue().cellValue).toBe(42)
  })

  it('build sheet with simple string cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 'foo' }],
    ]})

    const vertex = engine.addressMapping.fetchCell(adr('A1'))
    expect(vertex).toBeInstanceOf(ValueCellVertex)
    expect(vertex.getCellValue().cellValue).toBe('foo')
  })

  it('building for cell with null should give empty vertex', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: '=A1' }],
    ]})

    const vertex = engine.addressMapping.fetchCell(adr('A1'))
    expect(vertex).toBeInstanceOf(EmptyCellVertex)
  })

  it('#buildGraph works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=A1:B1' }],
    ]})

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const a1b2 = engine.rangeMapping.fetchRange(adr('A1'), adr('B1'))
    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    expect(engine.graph.adjacentNodes(a1)).toContain(a1b2)
    expect(engine.graph.adjacentNodes(b1)).toContain(a1b2)
    expect(engine.graph.adjacentNodes(a1b2)).toContain(a2)
  })

  it('#buildGraph works with column ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=A:B' }],
    ]})

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const ab = engine.rangeMapping.fetchRange(colStart('A'), colEnd('B'))
    const c1 = engine.addressMapping.fetchCell(adr('C1'))
    expect(engine.graph.adjacentNodes(a1)).toContain(ab)
    expect(engine.graph.adjacentNodes(b1)).toContain(ab)
    expect(engine.graph.adjacentNodes(ab)).toContain(c1)
  })

  it('async vertices dependencies should work', () => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASYNC_FOO()' }, { cellValue: '=ASYNC_FOO(A1)' }, { cellValue: '=A1 + B1' }, { cellValue: '=ASYNC_FOO(C1)+B1+A2'}],
      [{ cellValue: '=ASYNC_FOO()' }, { cellValue: '=ASYNC_FOO(A2)' }],
    ]})

    const a1 = engine.addressMapping.fetchCell(adr('A1')) as FormulaVertex
    const b1 = engine.addressMapping.fetchCell(adr('B1')) as FormulaVertex
    const c1 = engine.addressMapping.fetchCell(adr('C1')) as FormulaVertex
    const d1 = engine.addressMapping.fetchCell(adr('D1')) as FormulaVertex

    const a2 = engine.addressMapping.fetchCell(adr('A2')) as FormulaVertex
    const b2 = engine.addressMapping.fetchCell(adr('B2')) as FormulaVertex

    expect(a1.getResolveIndex()).toBe(0)
    expect(b1.getResolveIndex()).toBe(1)
    expect(c1.getResolveIndex()).toBe(1)
    expect(d1.getResolveIndex()).toBe(2)
    expect(a2.getResolveIndex()).toBe(0)
    expect(b2.getResolveIndex()).toBe(1)
  })

  it('#loadSheet - it should build graph with only one RangeVertex', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=A1:B1' }],
      [{ cellValue: '=A1:B1' }],
    ]})

    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const a1b2 = engine.rangeMapping.fetchRange(adr('A1'), adr('B1'))
    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    const a3 = engine.addressMapping.fetchCell(adr('A3'))

    expect(engine.graph.existsEdge(a1, a1b2)).toBe(true)
    expect(engine.graph.existsEdge(b1, a1b2)).toBe(true)
    expect(engine.graph.existsEdge(a1b2, a2)).toBe(true)
    expect(engine.graph.existsEdge(a1b2, a3)).toBe(true)
    expect(engine.graph.nodesCount()).toBe(
      4 + // for cells above
      1,  // for both ranges (reuse same ranges)
    )
  })

  it('build with range one row smaller', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }],
      [{ cellValue: '3' }, { cellValue: '=A1:A2' }],
      [{ cellValue: '5' }, { cellValue: '=A1:A3' }],
    ]})

    const a3 = engine.addressMapping.fetchCell(adr('A3'))
    const a1a2 = engine.rangeMapping.fetchRange(adr('A1'), adr('A2'))
    const a1a3 = engine.rangeMapping.fetchRange(adr('A1'), adr('A3'))

    expect(engine.graph.existsEdge(a3, a1a3)).toBe(true)
    expect(engine.graph.existsEdge(a1a2, a1a3)).toBe(true)
    expect(engine.graph.edgesCount()).toBe(
      2 + // from cells to range(A1:A2)
      2 + // from A3 and range(A1:A2) to range(A1:A3)
      2, // from range vertexes to formulas
    )
  })

  it('#buildGraph should work even if range dependencies are empty', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }, { cellValue: '=SUM(A1:B2)' }],
    ]})

    expect(engine.graph.nodesCount()).toBe(
      3 + // for cells above
      1 + // for range vertex
      2,  // for 2 EmptyCellVertex instances
    )
    expect(engine.graph.edgesCount()).toBe(
      2 + // from cells to range vertex
      2 + // from EmptyCellVertex instances to range vertices
      1,  // from range to cell with SUM
    )
  })

  it("optimization doesn't work if smaller range is after bigger", () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0' }],
      [{ cellValue: '3' }, { cellValue: '=A1:A3' }],
      [{ cellValue: '5' }, { cellValue: '=A1:A2' }],
    ]})

    const a1a2 = engine.rangeMapping.fetchRange(adr('A1'), adr('A2'))
    const a1a3 = engine.rangeMapping.fetchRange(adr('A1'), adr('A3'))
    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    expect(engine.graph.existsEdge(a2, a1a3)).toBe(true)
    expect(engine.graph.existsEdge(a2, a1a2)).toBe(true)
    expect(engine.graph.existsEdge(a1a2, a1a3)).toBe(false)
    expect(engine.graph.edgesCount()).toBe(
      3 + // from 3 cells to range(A1:A2)
      2 + // from 2 cells to range(A1:A2)
      2, // from range vertexes to formulas
    )
  })
})

describe('Sheet size limits', () => {
  it('should throw error when trying to build engine with too many columns', () => {
    const maxColumns = Config.defaultConfig.maxColumns
    const sheet = [new Array(maxColumns + 1).fill({ cellValue: '' })]

    expect(() => {
      HyperFormula.buildFromArray({ cells: sheet })
    }).toThrow(new SheetSizeLimitExceededError())
  })

  it('should throw error when trying to build engine with too many rows', () => {
    const maxRows = Config.defaultConfig.maxRows
    const sheet = new Array(maxRows + 1).fill([{ cellValue: '' }])

    expect(() => {
      HyperFormula.buildFromArray({ cells: sheet })
    }).toThrow(new SheetSizeLimitExceededError())
  })
})
