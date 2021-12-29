import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PERCENTILE.EXC', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      ['=PERCENTILE.EXC()'],
      ['=PERCENTILE.EXC(3, 0.5, 2)'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('throws error for non-numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [3],
      ['\'1'],
      [2],
      ['=PERCENTILE.EXC(A1:A3, 0.3)'],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [1],
      [2],
      [3],
      [4],
      ['=PERCENTILE.EXC(A1:A4, 0.3)'],
    ])

    expect(engine.getCellValue(adr('A5'))).toEqual(1.5)
  })
})