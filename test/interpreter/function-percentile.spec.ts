import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'


describe('Function PERCENTILE.INC', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=PERCENTILE.INC()' }],
      [{ cellValue: '=PERCENTILE.INC(3, 0.5, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('throws error for non-numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 3 }],
      [{ cellValue: '\'1' }],
      [{ cellValue: 2 }],
      [{ cellValue: '=PERCENTILE.INC(A1:A3, 0.3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 3 }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: '=PERCENTILE.INC(A1:A3, 0.3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1.6)
  })
})