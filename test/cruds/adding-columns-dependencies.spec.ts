import {HyperFormula} from '../../src'
import {EmptyCellVertex} from '../../src/DependencyGraph'
import {CellAddress} from '../../src/parser'

import {
  adr,
  colEnd,
  colStart,
  expectEngineToBeTheSameAs,
  extractReference,
  extractRowRange,
  rowEnd,
  rowStart
} from '../testUtils'

describe('Adding column, fixing dependency', () => {
  describe('all in same sheet (case 1)', () => {
    it('same sheet, case Aa, absolute column', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '=$A1' }],
      ])

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('C1'))).toEqual(CellAddress.absoluteCol(0, 0))
    })

    it('same sheet, case Aa, absolute row and col', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '=$A$1' }],
      ])

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('C1'))).toEqual(CellAddress.absolute(0, 0))
    })

    it('same sheet, case Ab', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=$B1' }, { cellValue: '42' }],
      ])

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.absoluteCol(2, 0))
    })

    it('same sheet, case Raa', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=B1' }, { cellValue: '13' }, { cellValue: '42' }],
      ])

      engine.addColumns(0, [2, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 1))
    })

    it('same sheet, case Rab', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '42' }, { cellValue: '13' }, { cellValue: '=B1' }],
      ])

      engine.addColumns(0, [2, 1])

      expect(extractReference(engine, adr('D1'))).toEqual(CellAddress.relative(0, -2))
    })

    it('same sheet, case Rba', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=C1' }, { cellValue: '13' }, { cellValue: '42' }],
      ])

      engine.addColumns(0, [2, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 3))
    })

    it('same sheet, case Rbb', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '42' }, { cellValue: '=C1' }, { cellValue: '13' }],
      ])

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('C1'))).toEqual(CellAddress.relative(0, 1))
    })

    it('same sheet, same column', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '42' }, { cellValue: '43' }],
        [{ cellValue: null }, { cellValue: '=B1' }],
      ])

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('C2'))).toEqual(CellAddress.relative(-1, 0))
    })
  })

  describe('dependency address sheet different than formula address sheet and sheet in which we add columns (case 2)', () => {
    it('absolute case', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue:   '=Sheet2!$A1' }],
        ],
        Sheet2: [
          [{ cellValue: '1' }],
        ],
      })

      engine.addColumns(0, [0, 1])

      expect(extractReference(engine, adr('B1'))).toEqual(CellAddress.absoluteCol(0, 0, 1))
    })

    it('R < r', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [ { cellValue: null }, { cellValue: '=Sheet2!A1' }],
        ],
        Sheet2: [
          [{ cellValue: '1' }],
        ],
      })

      engine.addColumns(0, [0, 1])

      expect(extractReference(engine, adr('C1'))).toEqual(CellAddress.relative(0, -2, 1))
    })

    it('r = R', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue:  '=Sheet2!B1' }],
        ],
        Sheet2: [
          [{ cellValue: null }, { cellValue: '1' }],
        ],
      })

      engine.addColumns(0, [0, 1])

      expect(extractReference(engine, adr('B1'))).toEqual(CellAddress.relative(0, 0, 1))
    })

    it('r < R', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue: '=Sheet2!A1' } ],
        ],
        Sheet2: [
          [{ cellValue: '1' }],
        ],
      })

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 0, 1))
    })
  })

  describe('formula address sheet different than dependency address sheet and sheet in which we add columns (case 3)', () => {
    it('dependency address before added column', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue:  '1' }, { cellValue: '2' }],
        ],
        Sheet2: [
          [{ cellValue: '=Sheet1!B1' }],
        ],
      })

      engine.addColumns(0, [0, 1])

      expect(extractReference(engine, adr('A1', 1))).toEqual(CellAddress.relative(0, 2, 0))
    })

    it('dependency address at added column', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue:  '1' }],
        ],
        Sheet2: [
          [{ cellValue: '=Sheet1!A1' }],
        ],
      })

      engine.addColumns(0, [0, 1])

      expect(extractReference(engine, adr('A1', 1))).toEqual(CellAddress.relative(0, 1, 0))
    })

    it('dependency address after added column', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue: '1' }],
        ],
        Sheet2: [
          [{ cellValue: '=Sheet1!A1' }],
        ],
      })

      engine.addColumns(0, [1, 1])

      expect(extractReference(engine, adr('A1', 1))).toEqual(CellAddress.relative(0, 0, 0))
    })
  })

  describe('sheet where we add columns different than dependency address and formula address (case 4)', () => {
    it('works', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue: '=B1' }, { cellValue: '13' }],
        ],
        Sheet2: [
          [{ cellValue: null }, { cellValue: '78' }],
        ],
      })

      engine.addColumns(1, [1, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 1))
    })
  })

  describe('each sheet different (case 5)', () => {
    it('works', () => {
      const [engine] = HyperFormula.buildFromSheets({
        Sheet1: [
          [{ cellValue: '=Sheet2!B1' }, { cellValue: '13' }],
        ],
        Sheet2: [
          [{ cellValue: null }, { cellValue: '78' }],
        ],
        Sheet3: [
          [{ cellValue: null }, { cellValue: null }],
        ],
      })

      engine.addColumns(2, [1, 1])

      expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 1, 1))
    })
  })
})

describe('Adding column, fixing ranges', () => {
  it('insert column to empty range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: null }, { cellValue: null }],
      [{ cellValue: '=SUM(A1:C1)' }],
    ])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).not.toBe(undefined)

    engine.addColumns(0, [1, 1])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).toBe(undefined)
    expect(engine.rangeMapping.getRange(adr('A1'), adr('D1'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: null }, { cellValue: null }, { cellValue: null}],
      [{ cellValue: '=SUM(A1:D1)' }],
    ])[0])
  })

  it('insert column in middle of range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUM(A1:C1)' }],
    ])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).not.toBe(undefined)

    engine.addColumns(0, [1, 1])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).toBe(undefined)
    expect(engine.rangeMapping.getRange(adr('A1'), adr('D1'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}],
      [{ cellValue: '=SUM(A1:D1)' }],
    ])[0])
  })

  it('insert column before range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue:  '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUM(A1:C1)' }],
    ])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).not.toBe(undefined)
    engine.addColumns(0, [0, 1])
    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).toBe(undefined)
    expect(engine.rangeMapping.getRange(adr('B1'), adr('D1'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '1' }, { cellValue: '2' }, { cellValue: '3'}],
      [{ cellValue: null }, { cellValue: '=SUM(B1:D1)' }],
    ])[0])
  })

  it('insert column after range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUM(A1:C1)' }],
    ])

    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).not.toBe(undefined)
    engine.addColumns(0, [3, 1])
    expect(engine.rangeMapping.getRange(adr('A1'), adr('C1'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: null}],
      [{ cellValue: '=SUM(A1:C1)' }],
    ])[0])
  })

  it('it should insert new cell with edge to only one range at right', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: '=SUM(A1:A1)'}, { cellValue: '=SUM(A1:B1)'},  { cellValue: '=SUM(A1:C1)'}, { cellValue: '=SUM(A1:D1)'}],
    ])

    engine.addColumns(0, [2, 1])

    const c1 = engine.addressMapping.fetchCell(adr('C1'))
    const a1d1 = engine.rangeMapping.fetchRange(adr('A1'), adr('D1'))
    const a1e1 = engine.rangeMapping.fetchRange(adr('A1'), adr('E1'))

    expect(engine.graph.existsEdge(c1, a1d1)).toBe(true)
    expect(engine.graph.existsEdge(c1, a1e1)).toBe(true)
    expect(engine.graph.adjacentNodesCount(c1)).toBe(2)
  })

  it('range start in column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(B1:D1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.getCell(adr('B1'))
    expect(b1).toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(C1:E1)' }],
    ])[0])
  })

  it('range start before added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(A1:D1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.fetchCell(adr('B1'))
    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('E1'))
    expect(b1).toBeInstanceOf(EmptyCellVertex)
    expect(engine.graph.existsEdge(b1, range)).toBe(true)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(A1:E1)' }],
    ])[0])
  })

  it('range start after added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(C1:D1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.getCell(adr('B1'))
    expect(b1).toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(D1:E1)' }],
    ])[0])
  })

  it('range end before added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(A1:A1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.getCell(adr('B1'))
    expect(b1).toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(A1:A1)' }],
    ])[0])
  })

  it('range end in a added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(A1:B1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('C1'))
    expect(b1).toBeInstanceOf(EmptyCellVertex)
    expect(engine.graph.existsEdge(b1, range)).toBe(true)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(A1:C1)' }],
    ])[0])
  })

  it('range end after added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(A1:C1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.fetchCell(adr('B1'))

    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('D1'))
    expect(b1).toBeInstanceOf(EmptyCellVertex)
    expect(engine.graph.existsEdge(b1, range)).toBe(true)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(A1:D1)' }],
    ])[0])
  })

  it('range start and end in an added column', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}],
      [{ cellValue: null }, { cellValue: '=SUM(B1:B1)' }],
    ])

    engine.addColumns(0, [1, 1])

    const b1 = engine.addressMapping.getCell(adr('B1'))
    expect(b1).toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '4' }],
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=SUM(C1:C1)' }],
    ])[0])
  })
})

describe('Adding column, fixing column ranges', () => {
  it('insert column in middle of column range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '=SUM(A:C)'}],
    ])

    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).not.toBe(undefined)

    engine.addColumns(0, [1, 1])

    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).toBe(undefined)
    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('D'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '=SUM(A:D)' }],
    ])[0])
  })

  it('insert column before column range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '=SUM(A:C)'}],
    ])

    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).not.toBe(undefined)
    engine.addColumns(0, [0, 1])
    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).toBe(undefined)
    expect(engine.rangeMapping.getRange(colStart('B'), colEnd('D'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '1' }, { cellValue: '2' }, { cellValue: '3'}, {cellValue: '=SUM(B:D)' }],
    ])[0])
  })

  it('insert column after column range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '=SUM(A:C)'}],
    ])

    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).not.toBe(undefined)
    engine.addColumns(0, [3, 1])
    expect(engine.rangeMapping.getRange(colStart('A'), colEnd('C'))).not.toBe(undefined)

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: null}, {cellValue: '=SUM(A:C)' }],
    ])[0])
  })
})

describe('Adding column, row range', () => {
  it('row range should not be affected', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1'}, { cellValue: '2'}, { cellValue: '3'}],
      [{ cellValue: '4'}, { cellValue: '5'}, { cellValue: '6'}],
      [{ cellValue: null}, { cellValue: null}, { cellValue: '=SUM(1:2)'}],
    ])

    engine.addColumns(0, [1, 1])

    expect(engine.rangeMapping.getRange(rowStart(1), rowEnd(2))).not.toBe(undefined)
    const rowRange = extractRowRange(engine, adr('D3'))
    expect(rowRange.start).toEqual(rowStart(1))
    expect(rowRange.end).toEqual(rowEnd(2))

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }, { cellValue: '2' }, { cellValue: '3'}],
      [{ cellValue: '4' }, { cellValue: null }, { cellValue: '5' }, { cellValue: '6'}],
      [{ cellValue: null }, { cellValue: null }, { cellValue: null }, { cellValue: '=SUM(1:2)'}],
    ])[0])
  })
})
