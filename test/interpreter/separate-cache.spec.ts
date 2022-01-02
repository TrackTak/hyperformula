import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('numeric aggreagtion functions', () => {
  it('should use separate caches', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 5 }, { cellValue: 10}, {cellValue: 20 }],
      [{ cellValue: '=MIN(A1:E1)' }, { cellValue: '=MAX(A1:E1)' }, { cellValue: '=SUM(A1:E1)' }, { cellValue: '=SUMSQ(A1:E1)'}, {cellValue: '=AVERAGE(A1:E1)' }],
      [{ cellValue: '=MIN(A1:E1)' }, { cellValue: '=MAX(A1:E1)' }, { cellValue: '=SUM(A1:E1)' }, { cellValue: '=SUMSQ(A1:E1)'}, {cellValue: '=AVERAGE(A1:E1)' }],
    ])
    expect(engine.getCellValue(adr('A3'))).toEqual(1)
    expect(engine.getCellValue(adr('B3'))).toEqual(20)
    expect(engine.getCellValue(adr('C3'))).toEqual(38)
    expect(engine.getCellValue(adr('D3'))).toEqual(530)
    expect(engine.getCellValue(adr('E3'))).toEqual(7.6)
  })
})
