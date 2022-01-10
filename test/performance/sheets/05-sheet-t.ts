import { DataRawCellContent } from '../../../src'
import {ExpectedValue} from '../benchmark'

export function sheet(rows: number = 10000) {
  const sheet = []

  let prev = 1

  const prettyRandomString = (chars: number) => [...Array(chars)].map(() => (~~(Math.random() * 36)).toString(36)).join('')

  while (prev <= rows) {
    const rowToPush = [
      { cellValue: prettyRandomString(30) },
      { cellValue: prettyRandomString(30) },
      { cellValue: `=CONCATENATE(A${prev}, B${prev})` },
    ]

    sheet.push(rowToPush)
    ++prev
  }
  return sheet
}

export function expectedValues(cells: DataRawCellContent[][]): ExpectedValue[] {
  return [
    {address: 'C1', value: `${cells[0][0].cellValue}${cells[0][1].cellValue}`},
    {address: 'C1000', value: `${cells[999][0].cellValue}${cells[999][1].cellValue}`},
    {address: 'C10000', value: `${cells[9999][0].cellValue}${cells[9999][1].cellValue}`},
  ]
}
