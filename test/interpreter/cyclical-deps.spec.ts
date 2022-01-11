import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {adr, detailedError} from '../testUtils'

describe('Cyclical dependencies and error literals', () => {
  it('Cyclical errors might not propagate', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=A2' }, { cellValue: '=A1' }],
      [{ cellValue: '=ISERROR(A1)' }, { cellValue: '=ISERROR(B1)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(true)
  })
  it('Errors should be parsed and propagated', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=B1' }, { cellValue: '=A1' }, { cellValue: '=ISERROR(B1)' }, { cellValue: '=C1+D1'}, {cellValue: '=ISERROR(D1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(true)
  })
})
