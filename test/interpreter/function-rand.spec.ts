import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - function RAND', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeGreaterThanOrEqual(0.0)
    expect(engine.getCellValue(adr('A1')).cellValue).toBeLessThan(1.0)
  })

  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RAND(42)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
})
