import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError, expectToBeCloseForComplex} from '../testUtils'

describe('Function IMPOWER', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPOWER(1)' }],
      [{ cellValue: '=IMPOWER(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPOWER("foo", 2)' }],
      [{ cellValue: '=IMPOWER(1, "foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPOWER(0, 1)' }],
      [{ cellValue: '=IMPOWER("-4", 0.1)' }],
      [{ cellValue: '=IMPOWER("-3+4i", -1)' }],
      [{ cellValue: '=IMPOWER(0, -1)' }],
      [{ cellValue: '=IMPOWER(0, 0)' }],
      [{ cellValue: '=IMPOWER("i", 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expectToBeCloseForComplex(engine, 'A2', '1.09247705577745+0.35496731310463i')
    expectToBeCloseForComplex(engine, 'A3', '-0.12-0.16i')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('1')
  })
})
