import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('Function ISBINARY', () => {
  it('should return true for binary numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISBINARY("1010")' }, { cellValue: '=ISBINARY(1001)' }, { cellValue: '=ISBINARY(010)' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(true)
    expect(engine.getCellValue(adr('B1'))).toEqual(true)
    expect(engine.getCellValue(adr('C1'))).toEqual(true)
  })

  it('should return false otherwise', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISBINARY("foo")' }, { cellValue: '=ISBINARY(123)' }, { cellValue: '=ISBINARY(TRUE())' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(false)
    expect(engine.getCellValue(adr('B1'))).toEqual(false)
    expect(engine.getCellValue(adr('C1'))).toEqual(false)
  })
})