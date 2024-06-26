import {HyperFormula} from '../src'
import {AbsoluteCellRange} from '../src/AbsoluteCellRange'
import {adr} from './testUtils'

describe('Interpreter - function RAND', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }, { cellValue: '42' }],
    ]})
    const valueBeforeRecomputation = engine.getCellValue(adr('A1')).cellValue

    engine.setCellContents(adr('B1'), { cellValue: '35' })

    expect(engine.getCellValue(adr('A1')).cellValue).not.toEqual(valueBeforeRecomputation)
  })

  it('cell which is dependent on volatile formula is also recomputed', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }, { cellValue: '42' }, { cellValue: '=A1' }],
    ]})
    const valueBeforeRecomputation = engine.getCellValue(adr('C1')).cellValue

    engine.setCellContents(adr('B1'), { cellValue: '35' })

    expect(engine.getCellValue(adr('C1')).cellValue).not.toEqual(valueBeforeRecomputation)
  })

  it('array cell which is dependent on volatile formula is also recomputed', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }, { cellValue: '42' }, { cellValue: '={A1}' }],
    ]})
    const valueBeforeRecomputation = engine.getCellValue(adr('C1')).cellValue

    engine.setCellContents(adr('B1'), { cellValue: '35' })

    expect(engine.getCellValue(adr('C1')).cellValue).not.toEqual(valueBeforeRecomputation)
  })

  it('formula can be recognized as volatile even if entered later', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=A2+A3' }, { cellValue: '42' }],
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '=RAND()' })

    const a1 = engine.addressMapping.getCell(adr('A1'))
    expect(engine.dependencyGraph.volatileVertices()).toEqual(new Set([a1]))
  })

  it('volatile vertices should not be recomputed after removing from graph', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }, { cellValue: '42' }],
    ]})

    engine.setCellContents(adr('A1'), { cellValue: '35' })

    expect(engine.dependencyGraph.verticesToRecompute()).toEqual(new Set())
  })

  it('volatile formula after moving is still volatile', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }, { cellValue: '42' }],
    ]})

    engine.moveCells(AbsoluteCellRange.spanFrom(adr('A1'), 1, 1), adr('A2'))

    const a2 = engine.addressMapping.getCell(adr('A2'))
    expect(engine.dependencyGraph.volatileVertices()).toEqual(new Set([a2]))
  })
})
