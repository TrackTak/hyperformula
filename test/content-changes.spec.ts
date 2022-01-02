import {CellValueChange, ChangeExporter, ContentChanges} from '../src/ContentChanges'
import { CellData } from '../src/interpreter/InterpreterValue'
import {SimpleRangeValue} from '../src/interpreter/SimpleRangeValue'
import {adr} from './testUtils'

class SimpleChangeExporter implements ChangeExporter<CellValueChange> {
  exportChange(change: CellValueChange): CellValueChange {
    return {address: change.address, value: change.value}
  }
}

class SpreadRangeExporter implements ChangeExporter<CellValueChange> {
  exportChange(change: CellValueChange): CellValueChange | CellValueChange[] {
    const value = change.value
    const address = change.address
    if (value instanceof SimpleRangeValue) {
      return Array.from(value.entriesFromTopLeftCorner(address)).map(([v, a]) => {
        return {address: a, value: v}
      })
    } else {
      return {address: address, value: value}
    }
  }
}

describe('ContentChanges', () => {
  const simpleChangeExporter = new SimpleChangeExporter()

  it('should be empty', () => {
    const contentChanges = ContentChanges.empty()

    expect(contentChanges.isEmpty()).toEqual(true)
  })

  it('should replace simple value change', () => {
    const contentChanges = ContentChanges.empty()

    contentChanges.addChange(new CellData(1), adr('A1'))
    contentChanges.addChange(new CellData(2), adr('A1'))

    const exportedChanges = contentChanges.exportChanges(simpleChangeExporter)
    expect(exportedChanges.length).toEqual(1)
    expect(exportedChanges).toContainEqual({address: adr('A1'), value: 2})
  })

  it('should export simple value change', () => {
    const contentChanges = ContentChanges.empty()

    contentChanges.addChange(new CellData(1), adr('A1'))

    const exportedChanges = contentChanges.exportChanges(simpleChangeExporter)

    expect(contentChanges.isEmpty()).toEqual(false)
    expect(exportedChanges.length).toEqual(1)
    expect(exportedChanges).toContainEqual({address: adr('A1'), value: 1})
  })

  it('should export SimpleRangeValue change', () => {
    const contentChanges = ContentChanges.empty()

    contentChanges.addChange(new CellData(SimpleRangeValue.onlyValues([[{ cellValue: 'foo' }, { cellValue: 'bar' }]])), adr('A1'))

    const exportedChanges = contentChanges.exportChanges(simpleChangeExporter)

    expect(exportedChanges.length).toEqual(1)
    expect(exportedChanges).toContainEqual({address: adr('A1'), value: SimpleRangeValue.onlyValues([[{ cellValue: 'foo' }, { cellValue: 'bar' }]])})
  })

  it('should add all changes', () => {
    const contentChanges = ContentChanges.empty()
    contentChanges.addChange(new CellData(1), adr('A1'))

    const otherChanges = ContentChanges.empty()
    otherChanges.addChange(new CellData(2), adr('A2'))
    contentChanges.addAll(otherChanges)

    const exportedChanges = contentChanges.exportChanges(simpleChangeExporter)
    expect(exportedChanges.length).toEqual(2)
    expect(exportedChanges).toContainEqual({address: adr('A1'), value: 1})
    expect(exportedChanges).toContainEqual({address: adr('A2'), value: 2})
  })

  it('should handle array change', () => {
    const contentChanges = ContentChanges.empty()
    contentChanges.addChange(new CellData(SimpleRangeValue.onlyValues([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])), adr('A1'))

    const exportedChanges = contentChanges.exportChanges(new SpreadRangeExporter())

    expect(exportedChanges.length).toEqual(4)
    expect(exportedChanges).toContainEqual({address: adr('A1'), value: 1})
    expect(exportedChanges).toContainEqual({address: adr('B1'), value: 2})
    expect(exportedChanges).toContainEqual({address: adr('A2'), value: 'foo'})
    expect(exportedChanges).toContainEqual({address: adr('B2'), value: 'bar'})
  })
})
