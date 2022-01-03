import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IMCONJUGATE', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMCONJUGATE()' }],
      [{ cellValue: '=IMCONJUGATE(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMCONJUGATE("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMCONJUGATE(0)' }],
      [{ cellValue: '=IMCONJUGATE("i")' }],
      [{ cellValue: '=IMCONJUGATE("-3+4i")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('-i')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('-3-4i')
  })
})
