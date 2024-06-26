import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError, expectToBeCloseForComplex} from '../testUtils'

describe('Function IMLOG2', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMLOG2()' }],
      [{ cellValue: '=IMLOG2(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMLOG2("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMLOG2(0)' }],
      [{ cellValue: '=IMLOG2("i")' }],
      [{ cellValue: '=IMLOG2("-3+4i")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expectToBeCloseForComplex(engine, 'A2', '2.2661800709136i')
    expectToBeCloseForComplex(engine, 'A3', '2.32192809488736+3.19455592937622i')
  })
})
