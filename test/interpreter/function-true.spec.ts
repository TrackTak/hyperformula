import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function TRUE', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
  })

  it('is 0-arity', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE(1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
})
