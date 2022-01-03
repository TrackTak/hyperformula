import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IMSUB', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUB(1)' }],
      [{ cellValue: '=IMSUB(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUB("foo", 1)' }],
      [{ cellValue: '=IMSUB(1, "foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUB(0, 1)' }],
      [{ cellValue: '=IMSUB("i", "-i")' }],
      [{ cellValue: '=IMSUB("-3+4i", "1+i")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('-1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('2i')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('-4+3i')
  })
})
