import {HyperFormula} from '../src'
import {adr} from './testUtils'

describe('escaped formulas', () => {
  it('should serialize properly', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '\'=SUM(2,2)' }]])
    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual('\'=SUM(2,2)')
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('=SUM(2,2)')
  })
})
