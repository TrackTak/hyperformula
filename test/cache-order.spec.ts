import {HyperFormula} from '../src'
import {adr} from './testUtils'

describe('cache order invariance', () => {
  it('should evaluate properly #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(A1,B1:C1)' }, { cellValue: '=SUM(B1:C1)' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('B2'))).toEqual(5)
  })

  it('should evaluate properly #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(B1:C1,A1)' }, { cellValue: '=SUM(B1:C1)' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('B2'))).toEqual(5)
  })

  it('should evaluate properly #3', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(B1:C1)' }, { cellValue: '=SUM(A1,B1:C1)' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(5)
    expect(engine.getCellValue(adr('B2'))).toEqual(6)
  })

  it('should evaluate properly #4', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(B1:C1)' }, { cellValue: '=SUM(B1:C1,A1)' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(5)
    expect(engine.getCellValue(adr('B2'))).toEqual(6)
  })
})
