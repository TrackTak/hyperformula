import {ExpectedValue} from '../benchmark'

export function sheet(rows: number = 5000) {
  const sheet = []
  sheet.push([{ cellValue: '1' }, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '0'}, { cellValue: '0' }])

  let prev = 1

  while (prev < rows) {
    const rowToPush = [
      { cellValue: `${prev + 1}`},
      { cellValue: '2'},
      { cellValue:'=3*5'},
      { cellValue:`=A${prev}+D${prev}`},
      { cellValue:`=SUM($A$1:A${prev})`},
    ]

    sheet.push(rowToPush)
    ++prev
  }
  return sheet
}

export function expectedValues(): ExpectedValue[] {
  return [
    {address: 'A5000', value: 5000},
    {address: 'B5000', value: 2},
    {address: 'C5000', value: 15},
    {address: 'D5000', value: 12497500},
    {address: 'E5000', value: 12497500},
  ]
}
