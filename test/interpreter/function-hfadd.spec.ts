import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.ADD', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.ADD(1)' }, { cellValue: '=HF.ADD(1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.ADD(2,3)' }],
      [{ cellValue: '=HF.ADD(1.0000000000001,-1)' }],
      [{ cellValue: '=HF.ADD(1,)' }],
      [{ cellValue: '=HF.ADD(,)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
  })

  it('should coerce to correct types', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.ADD(TRUE(),B1)' }],
      [{ cellValue: '=HF.ADD("1",)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.ADD("abcd",)' }],
      [{ cellValue: '=HF.ADD(NA(),)' }],
      [{ cellValue: '=HF.ADD(B3:C3,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('passes subtypes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=HF.ADD(B1,C1)' }, { cellValue: '1$' }, { cellValue: 1 }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
  })
})
