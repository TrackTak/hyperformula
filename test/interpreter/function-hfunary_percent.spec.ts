import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.UNARY_PERCENT', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.UNARY_PERCENT()' }, { cellValue: '=HF.UNARY_PERCENT(1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.UNARY_PERCENT(2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.02)
  })

  it('should coerce to correct types', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.UNARY_PERCENT(TRUE())' }],
      [{ cellValue: '=HF.UNARY_PERCENT(B2)' }],
      [{ cellValue: '=HF.UNARY_PERCENT("1")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.01)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0.01)
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.UNARY_PERCENT("abcd")' }],
      [{ cellValue: '=HF.UNARY_PERCENT(NA())' }],
      [{ cellValue: '=HF.UNARY_PERCENT(B3:C3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
