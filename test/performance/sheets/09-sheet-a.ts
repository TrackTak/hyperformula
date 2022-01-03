import {ExpectedValue} from '../benchmark'

export function sheet(rows: number = 10000) {
  const sheet = []
  sheet.push([{ cellValue: '1' }, { cellValue: '2'}, { cellValue: '3'}, { cellValue: '4'}, { cellValue: '5' }])

  let prev = 1

  while (prev < rows) {
    const rowToPush = [
      { cellValue: `${prev + 1}`},
      { cellValue: '3'},
      { cellValue: `=A${prev}*A${prev}`},
      { cellValue: `=C${prev + 1}*A${prev}+B${prev}`},
      { cellValue: `=C${prev}-D${prev}*D${prev}+D${prev}*C${prev}/7+C${prev}*C${prev}*3+7*2`},
    ]

    sheet.push(rowToPush)
    ++prev
  }
  return sheet
}

export function expectedValues(): ExpectedValue[] {
  return [
    {address: 'A10000', value: 10000},
    {address: 'B10000', value: 3},
    {address: 'C10000', value: 99980001},
  ]
}
