import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('dependencies with parenthesis', () => {
  it('should be collected when required', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1)' }],
      [{ cellValue: '=(A1)+((A3))' }],
      [{ cellValue: '=SUM(1)' }],
    ]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
  })

  it('should not build ref for special function', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COLUMN((((A1))))' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })
})
