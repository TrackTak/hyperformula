import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LEN', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEN()' }],
      [{ cellValue: '=LEN("foo", "bar")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEN("foo")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEN(1)' }],
      [{ cellValue: '=LEN(5+5)' }],
      [{ cellValue: '=LEN(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
  })
})
