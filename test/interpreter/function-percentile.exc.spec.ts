import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PERCENTILE.EXC', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PERCENTILE.EXC()' }],
      [{ cellValue: '=PERCENTILE.EXC(3, 0.5, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('throws error for non-numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 3 }],
      ['\'1'],
      [{ cellValue: 2 }],
      [{ cellValue: '=PERCENTILE.EXC(A1:A3, 0.3)' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      [{ cellValue: 4 }],
      [{ cellValue: '=PERCENTILE.EXC(A1:A4, 0.3)' }],
    ])

    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(1.5)
  })
})