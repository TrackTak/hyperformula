import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PI', () => {
  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=PI(1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
  it('should return PI with proper precision', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PI()' }],
    ], {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3.14159265358979)
  })
})
