import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError, expectToBeCloseForComplex} from '../testUtils'

describe('Function IMSQRT', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSQRT()' }],
      [{ cellValue: '=IMSQRT(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSQRT("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMSQRT(0)' }],
      [{ cellValue: '=IMSQRT("-4")' }],
      [{ cellValue: '=IMSQRT("-3+4i")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expectToBeCloseForComplex(engine, 'A2', '2i')
    expectToBeCloseForComplex(engine, 'A3', '1+2i')
  })
})
