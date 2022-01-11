import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IMDIV', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMDIV(1)' }],
      [{ cellValue: '=IMDIV(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMDIV("foo", 1)' }],
      [{ cellValue: '=IMDIV(1, "foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMDIV(0, 1)' }],
      [{ cellValue: '=IMDIV("i", "-i")' }],
      [{ cellValue: '=IMDIV("-3+4i", "1+i")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('-1')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('0.5+3.5i')
  })
})
