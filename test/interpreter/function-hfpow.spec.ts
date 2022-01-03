import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.POW', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.POW(1)' }, { cellValue: '=HF.POW(1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct defaults', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.POW(2,3)' }],
      [{ cellValue: '=HF.POW(,1)' }],
      [{ cellValue: '=HF.POW(,)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('should coerce to correct types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.POW(TRUE(),B1)' }],
      [{ cellValue: '=HF.POW("1",)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.POW("abcd",)' }],
      [{ cellValue: '=HF.POW(NA(),)' }],
      [{ cellValue: '=HF.POW(B3:C3,)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
