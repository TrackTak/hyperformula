import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.DIVIDE', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.DIVIDE(1)' }, { cellValue: '=HF.DIVIDE(1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct defaults', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.DIVIDE(6,4)' }],
      [{ cellValue: '=HF.DIVIDE(,1)' }],
      [{ cellValue: '=HF.DIVIDE(1,)' }],
      [{ cellValue: '=HF.DIVIDE(,)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1.5)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should coerce to correct types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.DIVIDE(TRUE(),1)' }],
      [{ cellValue: '=HF.DIVIDE(B2,1)' }],
      [{ cellValue: '=HF.DIVIDE("1",1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HF.DIVIDE("abcd",)' }],
      [{ cellValue: '=HF.DIVIDE(NA(),)' }],
      [{ cellValue: '=HF.DIVIDE(B3:C3,)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('passes subtypes', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=HF.DIVIDE(B1,C1)' }, { cellValue: '1$' }, { cellValue: 1 }]])
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
  })
})
