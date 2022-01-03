import {HyperFormula} from '../../src'
import {AlwaysSparse} from '../../src/DependencyGraph/AddressMapping/ChooseAddressMappingPolicy'
import {adr} from '../testUtils'

describe('swapping columns - checking if it is possible', () => {
  it('should validate numbers for negative columns', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[-1, 0]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[-1, 0]])
    ).toThrowError('Invalid arguments, expected column numbers to be nonnegative integers and less than sheet width.')
  })

  it('should validate sources for noninteger values', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[1, 1], [0.5, 0]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[1, 1], [0.5, 0]])
    ).toThrowError('Invalid arguments, expected column numbers to be nonnegative integers and less than sheet width.')
  })

  it('should validate sources for values exceeding sheet width', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[1, 1], [1, 1]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[3, 0]])
    ).toThrowError('Invalid arguments, expected column numbers to be nonnegative integers and less than sheet width.')
  })

  it('should validate sources to be unique', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 0], [0, 0], [0, 0]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[0, 0], [0, 0], [0, 0]])
    ).toThrowError('Invalid arguments, expected source column numbers to be unique.')
  })

  it('should validate sources to be permutation of targets', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 0], [0, 0], [0, 0]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[0, 0], [0, 0], [0, 0]])
    ).toThrowError('Invalid arguments, expected target column numbers to be permutation of source column numbers.')
  })

  it('should check for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: '=TRANSPOSE(A1:B1)' }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 2], [0, 2], [0, 2]])).toEqual(false)
    expect(() =>
      engine.swapColumnIndexes(0, [[0, 2], [0, 2], [0, 2]])
    ).toThrowError('Cannot perform this operation, source location has an array inside.')
  })

  it('should check for matrices only in moved columns', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: '=TRANSPOSE(A1:B1)' }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    expect(() =>
      engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    ).not.toThrowError()
  })
})

describe('swapping columns should correctly work', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 'abcd' }], [{ cellValue: 1 }, { cellValue: 'abcd' }], [{ cellValue: 1 }, { cellValue: 'abcd' }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    engine.swapColumnIndexes(0, [[0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 'abcd' }, { cellValue: 1 }], [{ cellValue: 'abcd' }, { cellValue: 1 }], [{ cellValue: 'abcd' }, { cellValue: 1 }]])
  })

  it('should return number of changed cells', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    const [ret] = engine.swapColumnIndexes(0, [[0, 1], [0, 1]])
    expect(ret.length).toEqual(6)
  })

  it('should work on static engine with uneven column', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 5 }]], {chooseAddressMappingPolicy: new AlwaysSparse()})
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    engine.swapColumnIndexes(0, [[0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }]])
  })

  it('should work with more complicated permutations', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }]])
  })

  it('should not move values unnecessarily', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 0], [0, 0]])).toEqual(true)
    const [ret] = engine.swapColumnIndexes(0, [[0, 0], [0, 0]])
    expect(ret.length).toEqual(0)
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 15 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }]])
  })
})

describe('swapping rows working with undo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
  })
})

describe('swapping rows working with redo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 15 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.swapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapColumnIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }]])
  })

  it('clears redo stack', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }]])
    engine.setCellContents(adr('A1'), { cellValue: 42 })
    engine.undo()

    engine.swapColumnIndexes(0, [[0, 0]])

    expect(engine.isThereSomethingToRedo()).toBe(false)
  })
})

describe('setting column order - checking if it is possible', () => {
  it('should check for length', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSetColumnOrder(0, [0])).toEqual(false)
    expect(() =>
      engine.setColumnOrder(0, [0])
    ).toThrowError('Invalid arguments, expected number of columns provided to be sheet width.')
  })

  it('should validate sources for noninteger values', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSetColumnOrder(0, [0, 0.5])).toEqual(false)
    expect(() =>
      engine.setColumnOrder(0, [0, 0.5])
    ).toThrowError('Invalid arguments, expected number of columns provided to be sheet width.')
  })

  it('should validate for repeated values', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [0, 1, 1])).toEqual(false)
    expect(() =>
      engine.setColumnOrder(0, [0, 1, 1])
    ).toThrowError('Invalid arguments, expected target column numbers to be permutation of source column numbers.')
  })

  it('should validate sources to be permutation of targets', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 3])).toEqual(false)
    expect(() =>
      engine.setColumnOrder(0, [1, 2, 3])
    ).toThrowError('Invalid arguments, expected target column numbers to be permutation of source column numbers.')
  })

  it('should check for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: '=TRANSPOSE(A1:B1)' }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [2, 1, 0])).toEqual(false)
    expect(() =>
      engine.setColumnOrder(0, [2, 1, 0])
    ).toThrowError('Cannot perform this operation, source location has an array inside.')
  })

  it('should check for matrices only in moved columns', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: '=TRANSPOSE(A1:B1)' }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 0, 2])).toEqual(true)
    expect(() =>
      engine.setColumnOrder(0, [1, 0, 2])
    ).not.toThrowError()
  })
})

describe('reorder base case', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 'abcd' }], [{ cellValue: 1 }, { cellValue: 'abcd' }], [{ cellValue: 1 }, { cellValue: 'abcd' }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 0])).toEqual(true)
    engine.setColumnOrder(0, [1, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 'abcd' }, { cellValue: 1 }], [{ cellValue: 'abcd' }, { cellValue: 1 }], [{ cellValue: 'abcd' }, { cellValue: 1 }]])
  })

  it('should return number of changed cells', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 0])).toEqual(true)
    const [ret] = engine.setColumnOrder(0, [1, 0])
    expect(ret.length).toEqual(6)
  })

  it('should work on static engine with uneven column', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 5 }]], {chooseAddressMappingPolicy: new AlwaysSparse()})
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 0])).toEqual(true)
    engine.setColumnOrder(0, [1, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }]])
  })

  it('should work with more complicated permutations', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0])).toEqual(true)
    engine.setColumnOrder(0, [1, 2, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }]])
  })

  it('should not move values unnecessarily', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [0, 1, 2])).toEqual(true)
    const [ret] = engine.setColumnOrder(0, [0, 1, 2])
    expect(ret.length).toEqual(0)
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0, 3, 4])).toEqual(true)
    engine.setColumnOrder(0, [1, 2, 0, 3, 4])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 15 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0, 3])).toEqual(true)
    engine.setColumnOrder(0, [1, 2, 0, 3])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }]])
  })
})

describe('reorder working with undo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.setColumnOrder(0, [1, 2, 0])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    engine.setColumnOrder(0, [1, 2, 0, 3, 4])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.setColumnOrder(0, [1, 2, 0, 3])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
  })
})

describe('reorder working with redo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.setColumnOrder(0, [1, 2, 0])
    engine.undo()
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }]])
    engine.setColumnOrder(0, [1, 2, 0, 3, 4])
    engine.undo()
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0, 3, 4])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: '=A1'}, {cellValue: '=SUM(A2:A3)' }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 15 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }], [{ cellValue: 6 }, { cellValue: 4 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.setColumnOrder(0, [1, 2, 0, 3])
    engine.undo()
    expect(engine.isItPossibleToSetColumnOrder(0, [1, 2, 0, 3, 4])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }], [{ cellValue: 3 }, { cellValue: '=B2' }, { cellValue: '=SUM(C2:C3)' }]])
  })

  it('clears redo stack', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }]])
    engine.setCellContents(adr('A1'), { cellValue: 42 })
    engine.undo()

    engine.setColumnOrder(0, [0])

    expect(engine.isThereSomethingToRedo()).toBe(false)
  })
})
