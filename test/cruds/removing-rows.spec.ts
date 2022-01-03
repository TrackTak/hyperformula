import {CellData, ExportedCellChange, HyperFormula, InvalidArgumentsError} from '../../src'
import {AbsoluteCellRange} from '../../src/AbsoluteCellRange'
import {ArrayVertex} from '../../src/DependencyGraph'
import {ColumnIndex} from '../../src/Lookup/ColumnIndex'
import {CellAddress} from '../../src/parser'
import {
  adr,
  expectArrayWithSameContent,
  expectEngineToBeTheSameAs,
  expectFunctionToHaveRefError,
  expectReferenceToHaveRefError,
  extractMatrixRange,
  extractRange,
  extractReference,
  noSpace,
  verifyRangesInSheet,
  verifyValues,
} from '../testUtils'

describe('Removing rows - checking if its possible', () => {
  it('no if starting row is negative', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(0, [-1, 1])).toEqual(false)
  })

  it('no if starting row is not an integer', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(0, [1.5, 2])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [NaN, 2])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [Infinity, 2])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [-Infinity, 2])).toEqual(false)
  })

  it('no if number of rows is negative', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(0, [0, -1])).toEqual(false)
  })

  it('no if number of rows is not an integer', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(0, [0, 1.5])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [0, NaN])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [0, Infinity])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(0, [0, -Infinity])).toEqual(false)
  })

  it('no if sheet does not exist', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(1, [0, 1])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(1.5, [0, 1])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(-1, [0, 1])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(NaN, [0, 1])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(Infinity, [0, 1])).toEqual(false)
    expect(engine.isItPossibleToRemoveRows(-Infinity, [0, 1])).toEqual(false)
  })

  it('yes if theres an array in place where we remove', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=TRANSPOSE(A1:B2)' }],
    ])

    expect(engine.isItPossibleToRemoveRows(0, [1, 1])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [1, 2])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [2, 1])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [3, 1])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [4, 1])).toEqual(true)
  })

  it('yes otherwise', () => {
    const [engine] = HyperFormula.buildFromArray([[]])

    expect(engine.isItPossibleToRemoveRows(0, [0, 1])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [1, 1])).toEqual(true)
    expect(engine.isItPossibleToRemoveRows(0, [1, 2])).toEqual(true)
  })
})

describe('Address dependencies, Case 1: same sheet', () => {
  it('case Aa: absolute dependency above removed row should not be affected', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }],
      [{ cellValue: '1' }],
      [{ cellValue: null }], // row to delete
      [{ cellValue: '=A$2' }],
    ])

    engine.removeRows(0, [2, 1])

    expect(extractReference(engine, adr('A3'))).toEqual(CellAddress.absoluteRow(0, 1))
  })

  it('case Ab: absolute dependency below removed row should be shifted', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A$3' }],
      [{ cellValue: null }], // row to delete
      [{ cellValue: '42' }],
    ])

    engine.removeRows(0, [1, 1])

    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.absoluteRow(0, 1))
  })

  it('case Ac: absolute dependency in removed row range should be replaced by #REF', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A$2' }],
      [{ cellValue: null }], // row to delete
    ])

    engine.removeRows(0, [1, 1])

    expectReferenceToHaveRefError(engine, adr('A1'))
  })

  it('case Raa: relative dependency and formula above removed rows should not be affected', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '42' }],
      [{ cellValue: '=A1' }],
      [{ cellValue: '2' }],
    ])

    engine.removeRows(0, [2, 1])

    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.relative(-1, 0))
  })

  it('case Rab: relative address should be shifted when only formula is moving', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '42' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=A1' }],
    ])

    engine.removeRows(0, [1, 2])

    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.relative(-1, 0))
  })

  it('case Rba: relative address should be shifted when only dependency is moving', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A4' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '42' }],
    ])

    engine.removeRows(0, [1, 2])

    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(1, 0))
  })

  it('case Rbb: relative address should not be affected when dependency and formula is moving', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=A4' }],
      [{ cellValue: '42' }],
    ])

    engine.removeRows(0, [0, 2])
    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(1, 0))
  })

  it('case Rca: relative dependency in deleted row range should be replaced by #REF', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A3' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
    ])

    engine.removeRows(0, [1, 2])
    expectReferenceToHaveRefError(engine, adr('A1'))
  })

  it('case Rcb: relative dependency in deleted row range should be replaced by #REF', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=A2' }],
    ])

    engine.removeRows(0, [0, 2])
    expectReferenceToHaveRefError(engine, adr('A2'))
  })

  it('case Rca, range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUM(A2:A3)' }],
      [{ cellValue: '1' }], //
      [{ cellValue: '2' }], //
    ])
    engine.removeRows(0, [1, 2])
    expectFunctionToHaveRefError(engine, adr('A1'))
  })
})

describe('Address dependencies, Case 2: formula in sheet where we make crud with dependency to other sheet', () => {
  it('case A: should not affect absolute dependencies', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '1' }], // row to delete
        [{ cellValue: '=Sheet2!A$1' }],
      ],
      Sheet2: [
        [{ cellValue: '2' }],
      ],
    })

    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.absoluteRow(0, 0, 1))
    engine.removeRows(0, [0, 1])
    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.absoluteRow(0, 0, 1))
  })

  it('case Ra: removing row above formula should shift dependency', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '1' }], // row to delete
        [{ cellValue: '=Sheet2!A1' }],
      ],
      Sheet2: [
        [{ cellValue: '2' }],
      ],
    })

    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.relative(-1, 0, 1))
    engine.removeRows(0, [0, 1])
    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 0, 1))
  })

  it('case Rb: removing row below formula should not affect dependency', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '=Sheet2!A1' }],
        [{ cellValue: '1' }], // row to delete
      ],
      Sheet2: [
        [{ cellValue: '2' }],
      ],
    })

    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 0, 1))
    engine.removeRows(0, [1, 1])
    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 0, 1))
  })
})

describe('Address dependencies, Case 3: formula in different sheet', () => {
  it('case ARa: relative/absolute dependency below removed row should be shifted ', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '=Sheet2!A3' }],
        [{ cellValue: '=Sheet2!A3' }],
        [{ cellValue: '=Sheet2!A3' }],
        [{ cellValue: '=Sheet2!A$3' }],
      ],
      Sheet2: [
        [{ cellValue: '1' }],
        [{ cellValue: '2' }], // row to delete
        [{ cellValue: '3' }],
      ],
    })

    engine.removeRows(1, [1, 1])

    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(1, 0, 1))
    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.relative(0, 0, 1))
    expect(extractReference(engine, adr('A3'))).toEqual(CellAddress.relative(-1, 0, 1))
    expect(extractReference(engine, adr('A4'))).toEqual(CellAddress.absoluteRow(0, 1, 1))
  })

  it('case ARb: relative/absolute dependency above removed row should not be affected', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '=Sheet2!A1' }],
        [{ cellValue: '=Sheet2!A$1' }],
      ],
      Sheet2: [
        [{ cellValue: '0' }],
        [{ cellValue: '1' }],  // row to delete
      ],
    })

    engine.removeRows(1, [1, 1])

    expect(extractReference(engine, adr('A1'))).toEqual(CellAddress.relative(0, 0, 1))
    expect(extractReference(engine, adr('A2'))).toEqual(CellAddress.absoluteRow(0, 0, 1))
  })

  it('case ARc: relative/absolute dependency in removed range should be replaced by #REF', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '=Sheet2!A$1' }],
        [{ cellValue: '=Sheet2!A1' }],
      ],
      Sheet2: [
        [{ cellValue: '1' }], // row to delete
        [{ cellValue: '2' }],
      ],
    })

    engine.removeRows(1, [0, 1])

    expectReferenceToHaveRefError(engine, adr('A1'))
    expectReferenceToHaveRefError(engine, adr('A2'))
  })

  it('does not truncate any ranges if rows are removed from different sheet', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: null }, { cellValue: '=SUM(A2:A3)' }],
        [{ cellValue: '2' }],
        [{ cellValue: '3' }],
      ],
      Sheet2: [
        [{ cellValue: '1' }],
      ],
    })

    engine.removeRows(1, [1, 1])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A3')))
  })
})

describe('Address dependencies, Case 4: remove rows in sheet different than formula or dependency sheet', () => {
  it('should not affect dependency when removing rows in not relevant sheet', function() {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '1' }], // to remove
      ],
      Sheet2: [
        [{ cellValue: '1' }],
        [{ cellValue: '=A1' }],
      ],
    })

    engine.removeRows(0, [0, 1])

    expect(extractReference(engine, adr('A2', 1))).toEqual(CellAddress.relative(-1, 0))
  })

  it('should not affect dependency when removing rows in not relevant sheet, more sheets', function() {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '1' }], // to remove
      ],
      Sheet2: [
        [{ cellValue: 'foo' }],
      ],
      Sheet3: [
        [{ cellValue: '1' }],
        [{ cellValue: '=Sheet2!A1' }],
      ],
    })

    engine.removeRows(0, [0, 1])

    expect(extractReference(engine, adr('A2', 2))).toEqual(CellAddress.relative(-1, 0, 1))
  })
})

describe('Removing rows - range dependencies, same sheet', () => {
  it('truncates range by one row from top if topmost row removed', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A3)' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
    ])

    engine.removeRows(0, [1, 1])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A2')))
  })

  it('truncates range by one row from bottom if last row removed', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A3)' }],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
    ])

    engine.removeRows(0, [2, 1])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A2')))
  })

  it('truncates range by rows from top if topmost rows removed', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A5)' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
    ])

    engine.removeRows(0, [1, 2])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A3')))
  })

  it('truncates range by rows from top if topmost rows removed - removing does not have to start with range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A3:A6)' }],
      [{ cellValue: null }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
      [{ cellValue: '6' }],
    ])

    engine.removeRows(0, [1, 3])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A3')))
  })

  it('truncates range by rows from top if topmost rows removed - removing does not have to start with range but may end on start', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A3:A6)' }],
      [{ cellValue: null }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
      [{ cellValue: '6' }],
    ])

    engine.removeRows(0, [1, 2])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A4')))
  })

  it('truncates range by rows from bottom if bottomest rows removed', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A5)' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
    ])

    engine.removeRows(0, [3, 2])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A3')))
  })

  it('truncates range by rows from bottom if bottomest rows removed - removing does not have to end with range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A5)' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
      [{ cellValue: null }],
    ])

    engine.removeRows(0, [3, 3])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A3')))
  })

  it('truncates range by rows from bottom if bottomest rows removed - removing does not have to end with range but may start on end', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=SUM(A2:A5)' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
      [{ cellValue: null }],
    ])

    engine.removeRows(0, [4, 2])

    expect(extractRange(engine, adr('B1'))).toEqual(new AbsoluteCellRange(adr('A2'), adr('A4')))
  })
})

describe('Removing rows - reevaluation', () => {
  it('reevaluates cells', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=COUNTBLANK(A1:A3)' }],
      [{ cellValue: null }], // deleted
      [{ cellValue: '3' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    engine.removeRows(0, [1, 1])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('dont reevaluate everything', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=COUNTBLANK(A1:A3)' }, { cellValue: '=SUM(A1:A1)' }],
      [{ cellValue: null }], // deleted
      [{ cellValue: '3' }],
    ])
    const b1 = engine.addressMapping.getCell(adr('B1'))
    const c1 = engine.addressMapping.getCell(adr('C1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b1setCellValueSpy = spyOn(b1 as any, 'setCellValue')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c1setCellValueSpy = spyOn(c1 as any, 'setCellValue')

    engine.removeRows(0, [1, 1])

    expect(b1setCellValueSpy).toHaveBeenCalled()
    expect(c1setCellValueSpy).not.toHaveBeenCalled()
  })

  it('reevaluates cells which are dependent on structure changes', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=COLUMNS(A1:B1)' }],
      [{ cellValue: '1' }],
    ])
    const c1 = engine.addressMapping.getCell(adr('C1'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c1setCellValueSpy = spyOn(c1 as any, 'setCellValue')

    engine.removeRows(0, [1, 1])

    expect(c1setCellValueSpy).toHaveBeenCalled()
  })

  it('should reevaluate formula when range reduced to zero', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=SUM(A1:A2)' }],
    ])

    const a3 = engine.addressMapping.getCell(adr('A3'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a3setCellValueSpy = spyOn(a3 as any, 'setCellValue')

    engine.removeRows(0, [0, 2])

    expect(a3setCellValueSpy).toHaveBeenCalled()
    expectFunctionToHaveRefError(engine, adr('A1'))
  })
})

describe('Removing rows - arrays', () => {
  it('ArrayVertex#formula should be updated', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '4' }],
      [{ cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '3' }, { cellValue: '6' }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }],
    ])

    engine.removeRows(0, [1, 1])

    expect(extractMatrixRange(engine, adr('A3'))).toEqual(new AbsoluteCellRange(adr('A1'), adr('B2')))
  })

  it('ArrayVertex#address should be updated', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '4' }],
      [{ cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '3' }, { cellValue: '6' }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }],
    ])

    engine.removeRows(0, [1, 1])

    const matrixVertex = engine.addressMapping.fetchCell(adr('A3')) as ArrayVertex
    expect(matrixVertex.getAddress(engine.lazilyTransformingAstService)).toEqual(adr('A3'))
  })

  it('ArrayVertex#formula should be updated when different sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '1' }, { cellValue: '4' }],
        [{ cellValue: '2' }, { cellValue: '5' }],
        [{ cellValue: '3' }, { cellValue: '6' }],
      ],
      Sheet2: [
        [{ cellValue: '=TRANSPOSE(Sheet1!A1:B3)' }],
      ],
    })

    engine.removeRows(0, [1, 1])

    expect(extractMatrixRange(engine, adr('A1', 1))).toEqual(new AbsoluteCellRange(adr('A1'), adr('B2')))
  })

  it('should be possible to remove row above array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [],
      [{ cellValue: '=-C2:D4' }],
      [],
      [],
      [{ cellValue: 'foo' }]
    ], {useArrayArithmetic: true})

    engine.removeRows(0, [0, 1])

    const [expected] = HyperFormula.buildFromArray([
      [{ cellValue: '=-C1:D3' }],
      [],
      [],
      [{ cellValue: 'foo' }]
    ], {useArrayArithmetic: true})

    expectEngineToBeTheSameAs(engine, expected)
  })

  it('removing row across array should not change array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: '=-A1:B3' }],
      [], [], [],
      [{ cellValue: 'foo' }]
    ], {useArrayArithmetic: true})

    engine.removeRows(0, [4, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: '=-A1:B3' }],
      [], [],
      [{ cellValue: 'foo' }]
    ], {useArrayArithmetic: true})[0])
  })

  it('removing row should shrink dependent array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [],
      [{ cellValue: 3 }, { cellValue: 4 }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }]
    ], {useArrayArithmetic: true})

    engine.removeRows(0, [1, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
      [{ cellValue: '=TRANSPOSE(A1:B2)' }]
    ], {useArrayArithmetic: true})[0])
  })

  it('it should be REF if no space after removing row', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-B3:B4' }],
      [],
      [{ cellValue: 1 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    engine.removeRows(0, [1, 1])

    expect(engine.getSheetValues(0)).toEqual([
      [noSpace()],
      [{ cellValue: 1 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 2 }],
    ])

    const [expected] = HyperFormula.buildFromArray([
      [{ cellValue: '=-B2:B3' }],
      [{ cellValue: 1 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 2 }]
    ], {useArrayArithmetic: true})
    expectEngineToBeTheSameAs(engine, expected)
  })

  it('it should be REF, not CYCLE, after removing rows', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-A3:A4' }],
      [],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }]
    ], {useArrayArithmetic: true})

    engine.removeRows(0, [1, 1])

    expect(engine.getSheetValues(0)).toEqual([
      [noSpace()],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }]
    ])

    const [expected] = HyperFormula.buildFromArray([
      [{ cellValue: '=-A2:A3' }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }]
    ], {useArrayArithmetic: true})
    expectEngineToBeTheSameAs(engine, expected)
  })

  it('it should remove array when removing row with left corner', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MMULT(A1:B2, A1:B2)' }],
    ])

    engine.removeRows(0, [2, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }]
    ])[0])
  })

  it('it should remove array when removing rows with whole matrix', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MMULT(A1:B2, A1:B2)' }],
    ])

    engine.removeRows(0, [2, 2])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }]
    ])[0])
  })
})

describe('Removing rows - graph', function() {
  it('should remove edges from other cells to removed nodes', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=A2' }], //
    ])

    engine.removeRows(0, [2, 1])

    const a2 = engine.addressMapping.fetchCell(adr('A2'))
    expect(engine.graph.adjacentNodes(a2)).toEqual(new Set())
  })

  it('should remove vertices from graph', function() {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
    ])
    expect(engine.graph.nodes.size).toBe(4)
    engine.removeRows(0, [0, 2])
    expect(engine.graph.nodes.size).toBe(0)
  })

  it('works if there are empty cells removed', function() {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: null }],
      [{ cellValue: '3' }],
    ])
    expect(engine.graph.nodes.size).toBe(2)
    engine.removeRows(0, [1, 1])
    expect(engine.graph.nodes.size).toBe(2)
  })
})

describe('Removing rows - range mapping', function() {
  it('shift ranges in range mapping, range start below removed rows', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: null }],
      [{ cellValue: '2' }, { cellValue: '=SUM(A2:A3)' }],
      [{ cellValue: '3' }, { cellValue: null }],
    ])

    engine.removeRows(0, [0, 1])
    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('A2'))
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    expect(engine.graph.existsEdge(a1, range)).toBe(true)
  })

  it('shift ranges in range mapping, range start above removed rows', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=SUM(A1:A3)' }],
      [{ cellValue: '2' }, { cellValue: null }],
      [{ cellValue: '3' }, { cellValue: null }],
    ])

    engine.removeRows(0, [1, 2])
    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('A1'))
    const a1 = engine.addressMapping.fetchCell(adr('A1'))
    expect(engine.graph.existsEdge(a1, range)).toBe(true)
  })

  it('shift ranges in range mapping, whole range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ])

    const range = engine.rangeMapping.fetchRange(adr('A1'), adr('A3'))
    engine.removeRows(0, [0, 3])
    const ranges = Array.from(engine.rangeMapping.rangesInSheet(0))
    expect(ranges.length).toBe(0)
    expect(engine.graph.hasNode(range)).toBe(false)
  })

  it('should remove smaller range dependency', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=SUM(A1:A2)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ])

    const a1a3 = engine.rangeMapping.fetchRange(adr('A1'), adr('A3'))
    expect(engine.graph.getDependencies(a1a3).length).toBe(2)
    engine.removeRows(0, [0, 2])
    const a1a1 = engine.rangeMapping.fetchRange(adr('A1'), adr('A1'))
    expect(a1a1).toBe(a1a3)
    expect(engine.graph.getDependencies(a1a1).length).toBe(1)
  })
})

describe('Removing rows - sheet dimensions', () => {
  it('should do nothing when removed row outside effective sheet', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recalcSpy = spyOn(engine.evaluator as any, 'partialRun')
    engine.removeRows(0, [1, 1])
    engine.removeRows(0, [10, 6])

    expect(recalcSpy).not.toHaveBeenCalled()
    expect(engine.getSheetDimensions(0)).toEqual({
      width: 1,
      height: 1,
    })
  })

  it('should throw error when trying to remove non positive number of rows', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
    ])

    expect(() => engine.removeRows(0, [1, 0])).toThrow(new InvalidArgumentsError('starting row to be smaller than the ending row.'))
  })

  it('returns changed values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=SUM(A1:A2)' }],
    ])

    const [changes] = engine.removeRows(0, [0, 1])

    expect(changes.length).toBe(1)
    expect(changes).toContainEqual(new ExportedCellChange(adr('A2'), new CellData(2)))
  })
})

describe('Removing rows - column index', () => {
  it('should update column index when adding row', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=VLOOKUP(2, A1:A10, 1, TRUE())' }],
      [{ cellValue: null }],
      [{ cellValue: '2' }],
    ], {useColumnIndex: true})

    engine.removeRows(0, [1, 1])

    const index = (engine.columnSearch as ColumnIndex)

    expectArrayWithSameContent([0], index.getValueIndex(0, 0, 1).index)
    expectArrayWithSameContent([1], index.getValueIndex(0, 0, 2).index)
  })
})

describe('Removing rows - row range', () => {
  it('removing rows - start of row range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:3)' }]
    ])

    engine.removeRows(0, [0, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:2)' }]
    ])[0])
  })

  it('removing rows - middle of row range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:3)' }]
    ])

    engine.removeRows(0, [1, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:2)' }]
    ])[0])
  })

  it('removing rows - end of row range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:3)' }]
    ])

    engine.removeRows(0, [2, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(1:2)' }]
    ])[0])
  })
})

describe('Removing rows - column range', () => {
  it('should not affect column range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=SUM(A:B)' }],
    ])

    engine.removeRows(0, [0, 1])

    expectEngineToBeTheSameAs(engine, HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=SUM(A:B)' }],
    ])[0])
  })
})

describe('Removing rows - merge ranges', () => {
  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 4, row: 0}, { cellValue: '=SUM(A1:C1)' })
    engine.setCellContents({sheet: 0, col: 3, row: 1}, { cellValue: '=SUM(A1:C2)' })
    engine.setCellContents({sheet: 0, col: 4, row: 0}, { cellValue: '=SUM(A1:C2)' })

    verifyRangesInSheet(engine, 0, ['A1:C1', 'A1:C2'])

    engine.addRows(0, [1, 2])
    engine.removeRows(0, [3, 1])

    verifyRangesInSheet(engine, 0, ['A1:C1', 'A1:C2', 'A1:C3'])

    engine.setCellContents({sheet: 0, col: 4, row: 0}, { cellValue: '=SUM(B2:B3)' })
    engine.addRows(0, [1, 2])

    verifyRangesInSheet(engine, 0, ['B4:B5'])
  })

  it('should not remove too much', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 3, row: 0}, { cellValue: '=SUM(A1:C2)' })
    engine.setCellContents({sheet: 0, col: 4, row: 0}, { cellValue: '=SUM(A1:C1)' })

    verifyRangesInSheet(engine, 0, ['A1:C1', 'A1:C2'])

    engine.addRows(0, [0, 2])
    engine.removeRows(0, [3, 1])

    verifyRangesInSheet(engine, 0, ['A3:C3'])
    verifyValues(engine)

    engine.setCellContents({sheet: 0, col: 3, row: 2}, { cellValue: '=SUM(A2:B3)' })
    engine.setCellContents({sheet: 0, col: 4, row: 2}, { cellValue: '=SUM(A2:B3)' })

    verifyRangesInSheet(engine, 0, ['A2:B3'])
    verifyValues(engine)
  })

  it('should merge ranges', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 2, row: 1}, { cellValue: 7 })
    engine.setCellContents({sheet: 0, col: 3, row: 0}, { cellValue: '=SUM(B2:C3)' })
    engine.setCellContents({sheet: 0, col: 6, row: 0}, { cellValue: '=SUM(D1:F2)' })
    engine.setCellContents({sheet: 0, col: 6, row: 2}, { cellValue: '=SUM(D1:F1)' })

    verifyRangesInSheet(engine, 0, ['D1:F1', 'D1:F2', 'B2:C3'])
    verifyValues(engine)

    engine.addRows(0, [0, 2])

    verifyRangesInSheet(engine, 0, ['D3:F3', 'D3:F4', 'B4:C5'])
    verifyValues(engine)

    engine.removeRows(0, [3, 1])

    verifyRangesInSheet(engine, 0, ['D3:F3', 'B4:C4'])
    verifyValues(engine)
  })

  it('Should properly deallocate all nodes', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 3, row: 2}, { cellValue: '=SUM(B2:C2)' })
    engine.setCellContents({sheet: 0, col: 5, row: 3}, { cellValue: '=SUM(B2:C3)' })

    engine.addRows(0, [2, 2])
    engine.removeRows(0, [4, 1])

    verifyRangesInSheet(engine, 0, ['B2:C2', 'B2:C3', 'B2:C4'])
    verifyValues(engine)

    engine.setCellContents({sheet: 0, col: 5, row: 4}, { cellValue: null })

    verifyRangesInSheet(engine, 0, [])
    verifyValues(engine)
    expect(engine.dependencyGraph.graph.nodesCount()).toBe(0)
    expect(engine.dependencyGraph.rangeMapping.getMappingSize(0)).toBe(0)
  })

  it('should merge ranges in proper order', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 0, row: 0}, { cellValue: '=SUM(A4:A6)' })
    engine.setCellContents({sheet: 0, col: 0, row: 1}, { cellValue: '=SUM(A4:A5)' })
    engine.setCellContents({sheet: 0, col: 0, row: 2}, { cellValue: '=SUM(A4:A4)' })

    engine.removeRows(0, [4, 1])

    verifyRangesInSheet(engine, 0, ['A4:A5', 'A4:A4'])
    verifyValues(engine)

    engine.setCellContents(adr('A1'), { cellValue: null })
    engine.setCellContents(adr('A2'), { cellValue: null })
    engine.setCellContents(adr('A3'), { cellValue: null })

    verifyRangesInSheet(engine, 0, [])
    verifyValues(engine)
  })

  it('should merge ranges with subranges in proper order', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 0, row: 1}, { cellValue: '=SUM(E1:E1)' })
    engine.setCellContents({sheet: 0, col: 0, row: 0}, { cellValue: '=SUM(E1:E2)' })

    engine.addRows(0, [1, 2])

    verifyRangesInSheet(engine, 0, ['E1:E1', 'E1:E2', 'E1:E3', 'E1:E4'])
    verifyValues(engine)

    engine.removeRows(0, [2, 1])

    verifyRangesInSheet(engine, 0, ['E1:E1', 'E1:E2', 'E1:E3'])
    verifyValues(engine)

    engine.setCellContents(adr('A1'), { cellValue: null })
    engine.setCellContents(adr('A3'), { cellValue: null })

    verifyRangesInSheet(engine, 0, [])
    verifyValues(engine)
  })

  it('should merge ranges when removing multiple rows', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 0, row: 3}, { cellValue: '=SUM(E1:E1)' })
    engine.setCellContents({sheet: 0, col: 0, row: 0}, { cellValue: '=SUM(E1:E3)' })

    verifyRangesInSheet(engine, 0, ['E1:E1', 'E1:E3'])

    engine.removeRows(0, [1, 2])

    verifyRangesInSheet(engine, 0, ['E1:E1'])
    verifyValues(engine)

    engine.setCellContents(adr('A1'), { cellValue: null })
    engine.setCellContents(adr('A2'), { cellValue: null })

    verifyRangesInSheet(engine, 0, [])
    verifyValues(engine)
  })

  it('should merge ranges when removing multiple rows 2', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 0, row: 3}, { cellValue: '=SUM(E1:E1)' })
    engine.setCellContents({sheet: 0, col: 0, row: 2}, { cellValue: '=SUM(E1:E2)' })

    engine.addRows(0, [1, 2])

    verifyRangesInSheet(engine, 0, ['E1:E1', 'E1:E2', 'E1:E3', 'E1:E4'])

    engine.setCellContents({sheet: 0, col: 0, row: 5}, { cellValue: '=SUM(E4:E4)' })

    verifyRangesInSheet(engine, 0, ['E1:E1', 'E1:E2', 'E1:E3', 'E1:E4', 'E4:E4'])

    engine.removeRows(0, [1, 3])

    verifyRangesInSheet(engine, 0, ['E1:E1'])
    verifyValues(engine)
  })

  it('should undo merge ranges', () => {
    const [engine] = HyperFormula.buildFromArray([])
    engine.setCellContents({sheet: 0, col: 2, row: 1}, { cellValue: 7 })
    engine.setCellContents({sheet: 0, col: 3, row: 0}, { cellValue: '=SUM(B2:C3)' })
    engine.setCellContents({sheet: 0, col: 6, row: 0}, { cellValue: '=SUM(D1:F2)' })
    engine.setCellContents({sheet: 0, col: 6, row: 2}, { cellValue: '=SUM(D1:F1)' })

    engine.addRows(0, [0, 2])
    engine.removeRows(0, [3, 1])

    verifyRangesInSheet(engine, 0, ['D3:F3', 'B4:C4'])
    verifyValues(engine)

    engine.undo()

    verifyRangesInSheet(engine, 0, ['D3:F3', 'D3:F4', 'B4:C5'])
    verifyValues(engine)
  })
})
