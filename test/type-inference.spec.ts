import {HyperFormula} from '../src'
import {CellValueDetailedType} from '../src/Cell'
import {adr} from './testUtils'

describe('arithmetic operations', () => {
  it('addition should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1+A1' }, { cellValue: '=A1+B1' }, { cellValue: '=A1+C1' }, { cellValue: '=A1+D1'}, {cellValue: '=A1+E1' }, { cellValue: '=A1+F1' }],
      [{ cellValue: '=B1+A1' }, { cellValue: '=B1+B1' }, { cellValue: '=B1+C1' }, { cellValue: '=B1+D1'}, {cellValue: '=B1+E1' }, { cellValue: '=B1+F1' }],
      [{ cellValue: '=C1+A1' }, { cellValue: '=C1+B1' }, { cellValue: '=C1+C1' }, { cellValue: '=C1+D1'}, {cellValue: '=C1+E1' }, { cellValue: '=C1+F1' }],
      [{ cellValue: '=D1+A1' }, { cellValue: '=D1+B1' }, { cellValue: '=D1+C1' }, { cellValue: '=D1+D1'}, {cellValue: '=D1+E1' }, { cellValue: '=D1+F1' }],
      [{ cellValue: '=E1+A1' }, { cellValue: '=E1+B1' }, { cellValue: '=E1+C1' }, { cellValue: '=E1+D1'}, {cellValue: '=E1+E1' }, { cellValue: '=E1+F1' }],
      [{ cellValue: '=F1+A1' }, { cellValue: '=F1+B1' }, { cellValue: '=F1+C1' }, { cellValue: '=F1+D1'}, {cellValue: '=F1+E1' }, { cellValue: '=F1+F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('B3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('D3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('E3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('F3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('A4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('B4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('C4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('E4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('F4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('A5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('B5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('C5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('D5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E5'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('F5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('B6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('C6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('D6'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('E6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F6'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('B7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('C7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('D7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('F7'))).toBe(CellValueDetailedType.NUMBER_RAW)
  })

  it('subtraction should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1-A1' }, { cellValue: '=A1-B1' }, { cellValue: '=A1-C1' }, { cellValue: '=A1-D1'}, {cellValue: '=A1-E1' }, { cellValue: '=A1-F1' }],
      [{ cellValue: '=B1-A1' }, { cellValue: '=B1-B1' }, { cellValue: '=B1-C1' }, { cellValue: '=B1-D1'}, {cellValue: '=B1-E1' }, { cellValue: '=B1-F1' }],
      [{ cellValue: '=C1-A1' }, { cellValue: '=C1-B1' }, { cellValue: '=C1-C1' }, { cellValue: '=C1-D1'}, {cellValue: '=C1-E1' }, { cellValue: '=C1-F1' }],
      [{ cellValue: '=D1-A1' }, { cellValue: '=D1-B1' }, { cellValue: '=D1-C1' }, { cellValue: '=D1-D1'}, {cellValue: '=D1-E1' }, { cellValue: '=D1-F1' }],
      [{ cellValue: '=E1-A1' }, { cellValue: '=E1-B1' }, { cellValue: '=E1-C1' }, { cellValue: '=E1-D1'}, {cellValue: '=E1-E1' }, { cellValue: '=E1-F1' }],
      [{ cellValue: '=F1-A1' }, { cellValue: '=F1-B1' }, { cellValue: '=F1-C1' }, { cellValue: '=F1-D1'}, {cellValue: '=F1-E1' }, { cellValue: '=F1-F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('B3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('D3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('E3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('F3'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('A4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('B4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('C4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('E4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('F4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('A5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('B5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('C5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('D5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E5'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('F5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('B6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('C6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('D6'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('E6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F6'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('B7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('C7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('D7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('F7'))).toBe(CellValueDetailedType.NUMBER_RAW)
  })

  it('multiplication should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1*A1' }, { cellValue: '=A1*B1' }, { cellValue: '=A1*C1' }, { cellValue: '=A1*D1'}, {cellValue: '=A1*E1' }, { cellValue: '=A1*F1' }],
      [{ cellValue: '=B1*A1' }, { cellValue: '=B1*B1' }, { cellValue: '=B1*C1' }, { cellValue: '=B1*D1'}, {cellValue: '=B1*E1' }, { cellValue: '=B1*F1' }],
      [{ cellValue: '=C1*A1' }, { cellValue: '=C1*B1' }, { cellValue: '=C1*C1' }, { cellValue: '=C1*D1'}, {cellValue: '=C1*E1' }, { cellValue: '=C1*F1' }],
      [{ cellValue: '=D1*A1' }, { cellValue: '=D1*B1' }, { cellValue: '=D1*C1' }, { cellValue: '=D1*D1'}, {cellValue: '=D1*E1' }, { cellValue: '=D1*F1' }],
      [{ cellValue: '=E1*A1' }, { cellValue: '=E1*B1' }, { cellValue: '=E1*C1' }, { cellValue: '=E1*D1'}, {cellValue: '=E1*E1' }, { cellValue: '=E1*F1' }],
      [{ cellValue: '=F1*A1' }, { cellValue: '=F1*B1' }, { cellValue: '=F1*C1' }, { cellValue: '=F1*D1'}, {cellValue: '=F1*E1' }, { cellValue: '=F1*F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A3'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B3'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('C3'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D3'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E3'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F3'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('B4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('C4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('B5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('C5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('B6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('C6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('B7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('C7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F7'))).toBe(CellValueDetailedType.NUMBER_RAW)
  })

  it('division should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1/A1' }, { cellValue: '=A1/B1' }, { cellValue: '=A1/C1' }, { cellValue: '=A1/D1'}, {cellValue: '=A1/E1' }, { cellValue: '=A1/F1' }],
      [{ cellValue: '=B1/A1' }, { cellValue: '=B1/B1' }, { cellValue: '=B1/C1' }, { cellValue: '=B1/D1'}, {cellValue: '=B1/E1' }, { cellValue: '=B1/F1' }],
      [{ cellValue: '=C1/A1' }, { cellValue: '=C1/B1' }, { cellValue: '=C1/C1' }, { cellValue: '=C1/D1'}, {cellValue: '=C1/E1' }, { cellValue: '=C1/F1' }],
      [{ cellValue: '=D1/A1' }, { cellValue: '=D1/B1' }, { cellValue: '=D1/C1' }, { cellValue: '=D1/D1'}, {cellValue: '=D1/E1' }, { cellValue: '=D1/F1' }],
      [{ cellValue: '=E1/A1' }, { cellValue: '=E1/B1' }, { cellValue: '=E1/C1' }, { cellValue: '=E1/D1'}, {cellValue: '=E1/E1' }, { cellValue: '=E1/F1' }],
      [{ cellValue: '=F1/A1' }, { cellValue: '=F1/B1' }, { cellValue: '=F1/C1' }, { cellValue: '=F1/D1'}, {cellValue: '=F1/E1' }, { cellValue: '=F1/F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A3'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B3'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('C3'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D3'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E3'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F3'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('A4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('B4'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('C4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F4'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('B5'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('C5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F5'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('B6'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('C6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F6'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('A7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('B7'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
    expect(engine.getCellValueDetailedType(adr('C7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('D7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('E7'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('F7'))).toBe(CellValueDetailedType.NUMBER_RAW)
  })

  it('percent should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1%' }, { cellValue: '=B1%' }, { cellValue: '=C1%' }, { cellValue: '=D1%'}, {cellValue: '=E1%' }, { cellValue: '=F1%' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('unary minus should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=-A1' }, { cellValue: '=-B1' }, { cellValue: '=-C1' }, { cellValue: '=-D1'}, {cellValue: '=-E1' }, { cellValue: '=-F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
  })

  it('unary plus should correctly infer types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1%' }, { cellValue: '1$' }, { cellValue: '01/01/1900'}, {cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=+A1' }, { cellValue: '=+B1' }, { cellValue: '=+C1' }, { cellValue: '=+D1'}, {cellValue: '=+E1' }, { cellValue: '=+F1' }],
    ])
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_RAW)
    expect(engine.getCellValueDetailedType(adr('B2'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValueDetailedType(adr('C2'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValueDetailedType(adr('D2'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValueDetailedType(adr('E2'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValueDetailedType(adr('F2'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
  })
})

describe('formatting info', () => {
  it('should be preserved by unary minus', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=-A1' }, { cellValue: '=-B1' }, { cellValue: '=C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C2'))).toBe('PLN')
  })

  it('should be preserved by unary plus', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=+A1' }, { cellValue: '=+B1' }, { cellValue: '=+C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C2'))).toBe('PLN')
  })

  it('should be preserved by addition', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=A1+A1' }, { cellValue: '=A1+B1' }, { cellValue: '=A1+C1' }],
      [{ cellValue: '=B1+A1' }, { cellValue: '=B1+B1' }, { cellValue: '=B1+C1' }],
      [{ cellValue: '=C1+A1' }, { cellValue: '=C1+B1' }, { cellValue: '=C1+C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('C2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('A3'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B3'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C3'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('A4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('B4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('C4'))).toBe('PLN')
  })

  it('should be preserved by subtraction', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=A1-A1' }, { cellValue: '=A1-B1' }, { cellValue: '=A1-C1' }],
      [{ cellValue: '=B1-A1' }, { cellValue: '=B1-B1' }, { cellValue: '=B1-C1' }],
      [{ cellValue: '=C1-A1' }, { cellValue: '=C1-B1' }, { cellValue: '=C1-C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('C2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('A3'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B3'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C3'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('A4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('B4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('C4'))).toBe('PLN')
  })

  it('should be preserved by multiplication', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=A1*A1' }, { cellValue: '=A1*B1' }, { cellValue: '=A1*C1' }],
      [{ cellValue: '=B1*A1' }, { cellValue: '=B1*B1' }, { cellValue: '=B1*C1' }],
      [{ cellValue: '=C1*A1' }, { cellValue: '=C1*B1' }, { cellValue: '=C1*C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('C2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('A3'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B3'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C3'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('A4'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('C4'))).toBe(undefined)
  })

  it('should be preserved by division', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1$' }, { cellValue: '1' }, { cellValue: '1PLN' }],
      [{ cellValue: '=A1/A1' }, { cellValue: '=A1/B1' }, { cellValue: '=A1/C1' }],
      [{ cellValue: '=B1/A1' }, { cellValue: '=B1/B1' }, { cellValue: '=B1/C1' }],
      [{ cellValue: '=C1/A1' }, { cellValue: '=C1/B1' }, { cellValue: '=C1/C1' }],
    ], {currencySymbol: [{ cellValue: '$' }, { cellValue: 'PLN' }]})
    expect(engine.getCellValueFormat(adr('A2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B2'))).toBe('$')
    expect(engine.getCellValueFormat(adr('C2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('A3'))).toBe('$')
    expect(engine.getCellValueFormat(adr('B3'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('C3'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('A4'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B4'))).toBe('PLN')
    expect(engine.getCellValueFormat(adr('C4'))).toBe(undefined)
  })
})

describe('Datetime formatting', () => {
  it('should be correctly inferred by addition', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '01/01/1900' }, { cellValue: '12:00' }, { cellValue: '01/01/1900 12:00' }],
      [{ cellValue: '=A1+A1' }, { cellValue: '=A1+B1' }, { cellValue: '=A1+C1' }],
      [{ cellValue: '=B1+A1' }, { cellValue: '=B1+B1' }, { cellValue: '=B1+C1' }],
      [{ cellValue: '=C1+A1' }, { cellValue: '=C1+B1' }, { cellValue: '=C1+C1' }],
    ])
    expect(engine.getCellValueFormat(adr('A2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B2'))).toBe('DD/MM/YYYY hh:mm')
    expect(engine.getCellValueFormat(adr('C2'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('A3'))).toBe('DD/MM/YYYY hh:mm')
    expect(engine.getCellValueFormat(adr('B3'))).toBe('hh:mm')
    expect(engine.getCellValueFormat(adr('C3'))).toBe('DD/MM/YYYY hh:mm')
    expect(engine.getCellValueFormat(adr('A4'))).toBe(undefined)
    expect(engine.getCellValueFormat(adr('B4'))).toBe('DD/MM/YYYY hh:mm')
    expect(engine.getCellValueFormat(adr('C4'))).toBe(undefined)
  })
})
