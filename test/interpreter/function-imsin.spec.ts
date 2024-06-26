import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError, expectToBeCloseForComplex} from '../testUtils'

describe('Function IMSIN', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSIN()' }],
      [{ cellValue: '=IMSIN(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSIN("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSIN(0)' }],
      [{ cellValue: '=IMSIN("i")' }],
      [{ cellValue: '=IMSIN("-3+4i")' }],
    ]})

    expectToBeCloseForComplex(engine, 'A1', '0')
    expectToBeCloseForComplex(engine, 'A2', '1.1752011936438i')
    expectToBeCloseForComplex(engine, 'A3', '-3.85373803791938-27.0168132580039i')
  })
})
