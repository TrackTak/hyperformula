import {HyperFormula} from '../../src'
import {AlwaysSparse} from '../../src/DependencyGraph/AddressMapping/ChooseAddressMappingPolicy'
import {adr} from '../testUtils'

describe('swapping rows - checking if it is possible', () => {
  it('should validate numbers for negative rows', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[-1, 0]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[-1, 0]])
    ).toThrowError('Invalid arguments, expected row numbers to be nonnegative integers and less than sheet height.')
  })

  it('should validate sources for noninteger values', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[1, 1], [0.5, 0]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[1, 1], [0.5, 0]])
    ).toThrowError('Invalid arguments, expected row numbers to be nonnegative integers and less than sheet height.')
  })

  it('should validate sources for values exceeding sheet height', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[1, 1], [1, 1]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[3, 0]])
    ).toThrowError('Invalid arguments, expected row numbers to be nonnegative integers and less than sheet height.')
  })

  it('should validate sources to be unique', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 0], [0, 0], [0, 0]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[0, 0], [0, 0], [0, 0]])
    ).toThrowError('Invalid arguments, expected source row numbers to be unique.')
  })

  it('should validate sources to be permutation of targets', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 0], [0, 0], [0, 0]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[0, 0], [0, 0], [0, 0]])
    ).toThrowError('Invalid arguments, expected target row numbers to be permutation of source row numbers.')
  })

  it('should check for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 2], [0, 2], [0, 2]])).toEqual(false)
    expect(() =>
      engine.swapRowIndexes(0, [[0, 2], [0, 2], [0, 2]])
    ).toThrowError('Cannot perform this operation, source location has an array inside.')
  })

  it('should check for matrices only in moved rows', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    expect(() =>
      engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    ).not.toThrowError()
  })
})

describe('swapping rows should correctly work', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 'abcd' }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 'abcd' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    engine.swapRowIndexes(0, [[0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 5 }, { cellValue: true }], [{ cellValue: 3 }, { cellValue: 5 }, { cellValue: true }]])
  })

  it('should return number of changed cells', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    const [ret] = engine.swapRowIndexes(0, [[0, 1], [0, 1]])
    expect(ret.length).toEqual(6)
  })

  it('should work on static engine with uneven rows', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 8 }]], {chooseAddressMappingPolicy: new AlwaysSparse()})
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1]])).toEqual(true)
    engine.swapRowIndexes(0, [[0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 8 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with more complicated permutations', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('should not move values unnecessarily', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 0], [0, 0]])).toEqual(true)
    const [ret] = engine.swapRowIndexes(0, [[0, 0], [0, 0]])
    expect(ret.length).toEqual(0)
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }]])
  })
})

describe('swapping rows working with undo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
  })
})

describe('swapping rows working with redo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.swapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])
    engine.undo()
    expect(engine.isItPossibleToSwapRowIndexes(0, [[0, 1], [0, 1], [0, 1]])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('clears redo stack', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }]])
    engine.setCellContents(adr('A1'), { cellValue: 42 })
    engine.undo()

    engine.swapRowIndexes(0, [[0, 0]])

    expect(engine.isThereSomethingToRedo()).toBe(false)
  })
})

function fillValues(order: number[], fill: number): number[] {
  while (order.length < fill) {
    const x = order.length
    order[x] = x
  }
  return order
}

describe('setting row order - checking if it is possible', () => {
  it('should check for length', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    expect(engine.isItPossibleToSetRowOrder(0, [0])).toEqual(false)
    expect(() =>
      engine.setRowOrder(0, [0])
    ).toThrowError('Invalid arguments, expected number of rows provided to be sheet height.')
  })

  it('should validate sources for noninteger values', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [0, 0.5])).toEqual(false)
    expect(() =>
      engine.setRowOrder(0, [0, 0.5])
    ).toThrowError('Invalid arguments, expected target row numbers to be permutation of source row numbers.')
  })

  it('should validate for repeated values', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [0, 1, 1])).toEqual(false)
    expect(() =>
      engine.setRowOrder(0, [0, 1, 1])
    ).toThrowError('Invalid arguments, expected target row numbers to be permutation of source row numbers.')
  })

  it('should validate sources to be permutation of targets', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [1, 2, 3])).toEqual(false)
    expect(() =>
      engine.setRowOrder(0, [1, 2, 3])
    ).toThrowError('Invalid arguments, expected target row numbers to be permutation of source row numbers.')
  })

  it('should check for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [2, 1, 0])).toEqual(false)
    expect(() =>
      engine.setRowOrder(0, [2, 1, 0])
    ).toThrowError('Cannot perform this operation, source location has an array inside.')
  })

  it('should check for matrices only in moved rows', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 0 }], [{ cellValue: 0 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [1, 0, 2])).toEqual(true)
    expect(() =>
      engine.setRowOrder(0, [1, 0, 2])
    ).not.toThrowError()
  })
})

describe('reorder base case', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 'abcd' }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 'abcd' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [1, 0])).toEqual(true)
    engine.setRowOrder(0, [1, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 3 }, { cellValue: 5 }, { cellValue: true }], [{ cellValue: 3 }, { cellValue: 5 }, { cellValue: true }]])
  })

  it('should return number of changed cells', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [1, 0])).toEqual(true)
    const [ret] = engine.setRowOrder(0, [1, 0])
    expect(ret.length).toEqual(6)
  })

  it('should work on static engine with uneven rows', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 8 }]], {chooseAddressMappingPolicy: new AlwaysSparse()})
    expect(engine.isItPossibleToSetRowOrder(0, [1, 0])).toEqual(true)
    engine.setRowOrder(0, [1, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 8 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with more complicated permutations', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [1, 2, 0])).toEqual(true)
    engine.setRowOrder(0, [1, 2, 0])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('should not move values unnecessarily', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetRowOrder(0, [0, 1])).toEqual(true)
    const [ret] = engine.setRowOrder(0, [0, 1])
    expect(ret.length).toEqual(0)
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.setRowOrder(0, [1, 2, 0, 3])
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    expect(engine.isItPossibleToSetRowOrder(0, fillValues([1, 2, 0], 15))).toEqual(true)
    engine.setRowOrder(0, fillValues([1, 2, 0], 15))
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }]])
  })
})

describe('reorder working with undo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.setRowOrder(0, [1, 2, 0])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.setRowOrder(0, [1, 2, 0, 3])
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.setRowOrder(0, fillValues([1, 2, 0], 15))
    engine.undo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
  })
})

describe('reorder working with redo', () => {
  it('should work on static engine', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
    engine.setRowOrder(0, [1, 2, 0])
    engine.undo()
    expect(engine.isItPossibleToSetRowOrder(0, [1, 2, 0])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('should work with external references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    engine.setRowOrder(0, [1, 2, 0, 3])
    engine.undo()
    expect(engine.isItPossibleToSetRowOrder(0, [1, 2, 0, 3])).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=A1' }, { cellValue: '=SUM(A2:A3)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: 7 }, { cellValue: 5 }]])
  })

  it('should work with internal references', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }], [{ cellValue: '=A2' }, { cellValue: '=SUM(B2:B3)' }, { cellValue: 3 }]])
    engine.setRowOrder(0, fillValues([1, 2, 0], 15))
    engine.undo()
    expect(engine.isItPossibleToSetRowOrder(0, fillValues([1, 2, 0], 16))).toEqual(true)
    engine.redo()
    expect(engine.getSheetSerialized(0)).toEqual([[{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }], [{ cellValue: '=SUM(#REF!)' }, { cellValue: 8 }, { cellValue: 9 }]])
  })

  it('clears redo stack', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }]])
    engine.setCellContents(adr('A1'), { cellValue: 42 })
    engine.undo()

    engine.setRowOrder(0, [0])

    expect(engine.isThereSomethingToRedo()).toBe(false)
  })
})
