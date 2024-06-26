import {HyperFormula} from '../src'
import {AbsoluteCellRange} from '../src/AbsoluteCellRange'
import {adr} from './testUtils'

describe('vertex counting', () => {
  it('one-time formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }]
    ]})
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(4)
    engine.calculateFormula('=SUM(A1:B2)', 0)
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(4)
  })

  it('cruds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }]
    ]})
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(4)
    engine.setCellContents(adr('A1'), { cellValue: '=SUM(A2:B2)' })
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(5)
    engine.setCellContents(adr('A1'), { cellValue: 1 })
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(4)
  })
})

describe('range mapping', () => {
  it('one-time formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }]
    ]})
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
    engine.calculateFormula('=SUM(A1:B2)', 0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('cruds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }]
    ]})
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
    engine.setCellContents(adr('A1'), { cellValue: '=SUM(A2:B2)' })
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(1)
    engine.setCellContents(adr('A1'), { cellValue: 1 })
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })
})

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

describe('larger tests', () => {

  it('large fixed', () => {
    const arr = [
      [
        '=SUM(B2:C4)',
      ],
      [
        null,
        '=SUM(A3:B3)',
      ],
      [
        '=SUM(B2:C3)',
      ],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: arr })
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        engine.setCellContents({sheet: 0, col: x, row: y}, { cellValue: null })
      }
    }
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('large fixed #2', () => {
    const arr = [
      [
        null,
        '=SUM(A1:A2)',
        '=SUM(A1:A1)',
        '=SUM(A1:A2)',
      ],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: arr })
    engine.setCellContents({sheet: 0, col: 1, row: 0}, { cellValue: null })
    engine.setCellContents({sheet: 0, col: 2, row: 0}, { cellValue: null })
    engine.setCellContents({sheet: 0, col: 3, row: 0}, { cellValue: null })
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('large fixed #3', () => {
    const arr = [
      [
        '=SUM(A1:B1)',
      ],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: arr })

    engine.setCellContents({sheet: 0, col: 0, row: 0}, { cellValue: null })

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('large fixed #4', () => {
    const arr = [
      [
        null, '=SUM(A1:A1)', '=SUM(A1:A2)', '=SUM(A1:A3)', '=SUM(A1:A4)',
      ],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: arr })

    engine.setCellContents({sheet: 0, col: 1, row: 0}, { cellValue: null })
    engine.setCellContents({sheet: 0, col: 2, row: 0}, { cellValue: null })
    engine.setCellContents({sheet: 0, col: 3, row: 0}, { cellValue: null })
    engine.setCellContents({sheet: 0, col: 4, row: 0}, { cellValue: null })

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('repeat the same crud', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    for (let tmp = 0; tmp < 3; tmp++) {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const col1 = randomInteger(2, 7)
          const row1 = randomInteger(2, 7)
          const col2 = col1 + randomInteger(-2, 2)
          const row2 = row1 + randomInteger(-2, 2)
          const startAddress = engine.simpleCellAddressToString({
            sheet: 0,
            row: Math.min(row1, row2),
            col: Math.min(col1, col2)
          }, 0)
          const endAddress = engine.simpleCellAddressToString({
            sheet: 0,
            row: Math.max(row1, row2),
            col: Math.max(col1, col2)
          }, 0)
          const formula = '=SUM(' + startAddress + ':' + endAddress + ')'
          engine.setCellContents({sheet: 0, col: x, row: y}, { cellValue: formula })
        }
      }
    }
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        engine.setCellContents({sheet: 0, col: x, row: y}, { cellValue: null })
      }
    }
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })
})

describe('cruds', () => {
  it('should collect empty vertices when bigger range is no longer bind to smaller range #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A2)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ]})

    engine.removeRows(0, [0, 2])
    engine.removeRows(0, [2, 2])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A2)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ]})

    engine.addRows(0, [2, 1])
    engine.removeRows(0, [0, 2])
    engine.removeRows(0, [2, 2])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #3', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A2)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ]})
    engine.addRows(0, [2, 1])

    engine.removeRows(0, [4, 2])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #4', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A3)' }],
      [{ cellValue: '=SUM(A1:A2)' }],
    ]})
    engine.addRows(0, [1, 1])

    engine.setCellContents(adr('A1'), [[{ cellValue: 1 }], [{ cellValue: 2 }], [{ cellValue: 3}], [{ cellValue: 4 }]])

    expect(engine.getCellValue(adr('A5')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(6)

    engine.removeRows(0, [0, 6])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #5', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A4)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ]})

    engine.setCellContents(adr('A1'), [[{ cellValue: 1 }], [{ cellValue: 2 }], [{ cellValue: 3 }], [{ cellValue: 4 }]])

    expect(engine.getCellValue(adr('A5')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(6)

    engine.removeRows(0, [0, 6])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #6', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      [{ cellValue: 4 }],
      [{ cellValue: '=SUM(A1:A4)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ]})

    expect(engine.getCellValue(adr('A5')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(6)

    engine.removeRows(0, [0, 6])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should collect empty vertices when bigger range is no longer bind to smaller range #7', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [],
      [],
      [],
      [{ cellValue: '=SUM(A1:A2)' }, { cellValue: '=SUM(B1:B3)' }],
      [{ cellValue: '=SUM(A1:A3)' }, { cellValue: '=SUM(B1:B2)' }],
    ]})
    engine.addRows(0, [1, 1])

    engine.setCellContents(adr('A1'), [[{ cellValue: 1 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 4 }]])

    expect(engine.getCellValue(adr('A5')).cellValue).toBe(6)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('B6')).cellValue).toBe(6)

    engine.removeRows(0, [0, 6])

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('column adding', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 0 }, { cellValue: 0 }],
      [{ cellValue: 0 }, { cellValue: 0 }],
      [{ cellValue: 0 }, { cellValue: 0 }],
      [{ cellValue: '=SUM(A1:B2)' }],
      [{ cellValue: '=SUM(A1:B3)' }]
    ]})
    engine.addColumns(0, [1, 1])
    engine.setCellContents(adr('B3'), { cellValue: 1 })
    expect(engine.getCellSerialized(adr('A4')).cellValue).toBe('=SUM(A1:C2)')
    expect(engine.getCellSerialized(adr('A5')).cellValue).toBe('=SUM(A1:C3)')
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(1)
  })

  it('movecell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      [{ cellValue: 4 }],
      [{ cellValue: '=SUM(A1:A3)' }],
      [{ cellValue: '=SUM(A1:A4)' }],
    ]})
    engine.moveCells(AbsoluteCellRange.spanFrom(adr('A1'), 1, 3), adr('B1'))
    engine.setCellContents(adr('B1'), { cellValue: null })
    engine.setCellContents(adr('B2'), { cellValue: null })
    engine.setCellContents(adr('B3'), { cellValue: null })
    engine.setCellContents(adr('A4'), { cellValue: null })
    engine.setCellContents(adr('A5'), { cellValue: null })
    engine.setCellContents(adr('A6'), { cellValue: null })

    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('addColumns after addRows', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
      [{ cellValue: '2' }, { cellValue: '=SUM($A$1:A1)' }],
      [{ cellValue: '3' }, { cellValue: '=SUM($A$1:A2)' }],
    ]})

    engine.addRows(0, [1, 1])
    engine.addColumns(0, [0, 1])
    engine.removeColumns(0, [0, 1])

    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual(3)
  })
})
