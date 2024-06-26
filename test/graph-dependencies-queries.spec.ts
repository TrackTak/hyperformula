import {HyperFormula} from '../src'
import {simpleCellRange} from '../src/AbsoluteCellRange'
import {adr} from './testUtils'

describe('address queries', () => {
  it('reverse dependencies should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: '=SUM(A1:B1)' }, { cellValue: '=SUMSQ(A1:B1)' }],
      [{ cellValue: '=A2+B2' }],
    ]})
    expect(engine.getCellDependents(adr('A1'))).toEqual([simpleCellRange(adr('A1'), adr('B1'))])
    expect(engine.getCellDependents(adr('D1'))).toEqual([])
    expect(engine.getCellDependents(adr('A2'))).toEqual([adr('A3')])
    expect(engine.getCellDependents(adr('B2'))).toEqual([adr('A3')])
    expect(engine.getCellDependents(adr('A3'))).toEqual([])

    expect(engine.getCellDependents(simpleCellRange(adr('A1'), adr('B1')))).toEqual([adr('A2'), adr('B2')])
    expect(engine.getCellDependents(simpleCellRange(adr('A3'), adr('B3')))).toEqual([])
  })

  it('dependencies should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: '=SUM(A1:B1)' }, { cellValue: '=SUMSQ(A1:B1)' }],
      [{ cellValue: '=A2+B2' }],
    ]})
    expect(engine.getCellPrecedents(adr('A1'))).toEqual([])
    expect(engine.getCellPrecedents(adr('D1'))).toEqual([])
    expect(engine.getCellPrecedents(adr('A2'))).toEqual([simpleCellRange(adr('A1'), adr('B1'))])
    expect(engine.getCellPrecedents(adr('B2'))).toEqual([simpleCellRange(adr('A1'), adr('B1'))])
    expect(engine.getCellPrecedents(adr('A3'))).toEqual([adr('A2'), adr('B2')])

    expect(engine.getCellPrecedents(simpleCellRange(adr('A1'), adr('B1')))).toEqual([adr('A1'), adr('B1')])
    expect(engine.getCellPrecedents(simpleCellRange(adr('A3'), adr('B3')))).toEqual([])
  })

  it('all dependencies should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: '=SUM(A1:B1)' }, { cellValue: '=SUMSQ(A1:B1)' }],
      [{ cellValue: '=A2+B2' }],
    ]})
    expect(engine.getAllCellPrecedents(adr('A1'))).toEqual([])
    expect(engine.getAllCellPrecedents(adr('D1'))).toEqual([])
    expect(engine.getAllCellPrecedents(adr('A2'))).toEqual([adr('A1'), adr('B1')])
    expect(engine.getAllCellPrecedents(adr('B2'))).toEqual([adr('A1'), adr('B1')])
    expect(engine.getAllCellPrecedents(adr('A3'))).toEqual([adr('A2'), adr('B2'), adr('A1'), adr('B1')])

    expect(engine.getAllCellPrecedents(simpleCellRange(adr('A1'), adr('B1')))).toEqual([adr('A1'), adr('B1')])
    expect(engine.getAllCellPrecedents(simpleCellRange(adr('A3'), adr('B3')))).toEqual([])
  })
})
