import {DataRawCellContent, Sheet} from '../../../src'
import {columnIndexToLabel, simpleCellAddressToString} from '../../../src/parser/addressRepresentationConverters'

export function sheet(cols: number = 50) {
  const sheet: Sheet = []

  const firstRow: DataRawCellContent[] = [{ cellValue: 1 }]

  for (let i = 1; i < cols; ++i) {
    const adr = simpleCellAddressToString(() => '', {sheet: 0, row: 0, col: i - 1}, 0)
    firstRow.push({ cellValue: `=${adr} + 1`})
  }

  sheet.push(firstRow)

  for (let i = 1; i < cols; ++i) {
    const rowToPush: DataRawCellContent[] = []

    rowToPush.push(...Array(i).fill(null))

    const startColumn = columnIndexToLabel(i - 1)

    for (let j = i - 1; j < cols - 1; ++j) {
      const endColumn = columnIndexToLabel(j)
      rowToPush.push({ cellValue: `=SUM(${startColumn}:${endColumn})`})
    }

    sheet.push(rowToPush)
  }

  return sheet
}
