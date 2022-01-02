import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - function RAND', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RAND()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBeGreaterThanOrEqual(0.0)
    expect(engine.getCellValue(adr('A1'))).toBeLessThan(1.0)
  })

  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RAND(42)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
})
