import { Sheet } from '../../../src'
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

export function expectedValues(sheet: Sheet): ExpectedValue[] {
  return [
    {address: 'C1', value: `${sheet[0][0].cellValue}${sheet[0][1].cellValue}`},
    {address: 'C1000', value: `${sheet[999][0].cellValue}${sheet[999][1].cellValue}`},
    {address: 'C10000', value: `${sheet[9999][0].cellValue}${sheet[9999][1].cellValue}`},
  ]
}
