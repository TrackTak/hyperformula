import {HyperFormula} from '../../src'
import {normalizeAddedIndexes, normalizeRemovedIndexes} from '../../src/Operations'
import {adr, expectArrayWithSameContent} from '../testUtils'

describe('batch cruds', () => {
  it('should run batch cruds and call recompute only once', () => {
    const [engine] = HyperFormula.buildFromArray([
      //
      [{ cellValue: 'foo' }],
      //
      [{ cellValue: 'bar' }],
    ])

    const evaluatorSpy = spyOn(engine.evaluator, 'partialRun')

    engine.batch(() => {
      engine.setCellContents(adr('B1'), [[{ cellValue: '=A1' }]])
      engine.addRows(0, [{ cellValue: 0 }, { cellValue: 1 }], [{ cellValue: 0 }, { cellValue: 1 }])
      engine.removeRows(0, [{ cellValue: 0 }, { cellValue: 1 }])
    })

    expect(evaluatorSpy).toHaveBeenCalledTimes(1)
    expect(engine.getCellValue(adr('A1'))).toEqual('foo')
    expect(engine.getCellValue(adr('A2'))).toBe(null)
    expect(engine.getCellValue(adr('A3'))).toEqual('bar')
  })

  it('should run batch cruds unitl fail and call recompute only once', () => {
    const [engine] = HyperFormula.buildFromArray([
      //
      [{ cellValue: 'foo' }],
      //
      [{ cellValue: 'bar' }],
    ])

    const evaluatorSpy = spyOn(engine.evaluator, 'partialRun')

    try {
      engine.batch(() => {
        engine.setCellContents(adr('B1'), [[{ cellValue: '=A1' }]])
        engine.addRows(0, [{ cellValue: 0 }, { cellValue: 1 }], [{ cellValue: 0 }, { cellValue: 1 }])
        engine.removeRows(0, [{ cellValue: 0 }, { cellValue: 1 }])
        engine.addRows(1, [{ cellValue: 0 }, { cellValue: 1 }]) // fail
        engine.addRows(0, [{ cellValue: 0 }, { cellValue: 1 }])
      })
    } catch (e) {
      // empty line
    }

    expect(evaluatorSpy).toHaveBeenCalledTimes(1)
    expect(engine.getCellValue(adr('A1'))).toEqual('foo')
    expect(engine.getCellValue(adr('A2'))).toBe(null)
    expect(engine.getCellValue(adr('A3'))).toEqual('bar')
  })
})

describe('normalize added indexes', () => {
  it('should return empty array', () => {
    const normalized = normalizeAddedIndexes([])
    expectArrayWithSameContent(normalized, [])
  })

  it('should return unchanged one element array', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 8 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 8 }]])
  })

  it('should return shifted further indexes when expanding', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
  })

  it('should merge indexes with same start', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 7 }]])
  })

  it('should return shift further indexes - more arguments', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
  })

  it('should return shift further indexes even when they overlap', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 5 }], [{ cellValue: 3 }, { cellValue: 5 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 5 }], [{ cellValue: 3 }, { cellValue: 5 }]])
  })

  it('should normalize unsorted indexes', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 5 }, { cellValue: 9 }], [{ cellValue: 5 }, { cellValue: 9 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 5 }], [{ cellValue: 3 }, { cellValue: 5 }]])
  })

  it('mixed case', () => {
    const normalized = normalizeAddedIndexes([[{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }]])
  })
})

describe('normalize removed indexes', () => {
  it('should return empty array', () => {
    const normalized = normalizeRemovedIndexes([])
    expectArrayWithSameContent(normalized, [])
  })

  it('should return unchanged one element array', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 8 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 8 }]])
  })

  it('should return shifted further indexes', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
  })

  it('should return shift further indexes - more arguments', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: 3 }]])
  })

  it('should normalize adjacent indexes', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 5 }], [{ cellValue: 3 }, { cellValue: 5 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 10 }]])
  })

  it('should normalize overlapping indexes', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 5 }], [{ cellValue: 3 }, { cellValue: 5 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 11 }]])
  })

  it('should normalize unsorted indexes', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 5 }, { cellValue: 9 }], [{ cellValue: 5 }, { cellValue: 9 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 3 }, { cellValue: 11 }]])
  })

  it('mixed case', () => {
    const normalized = normalizeRemovedIndexes([[{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }], [{ cellValue: 3 }, { cellValue: 7 }]])
    expectArrayWithSameContent(normalized, [[{ cellValue: 1 }, { cellValue: 1 }], [{ cellValue: 1 }, { cellValue: 1 }], [{ cellValue: 1 }, { cellValue: 1 }]])
  })
})
