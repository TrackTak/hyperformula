import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.CONCAT', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.CONCAT(1)' }, { cellValue: '=HF.CONCAT(1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.CONCAT("hokuspokus","czarymary")' }],
      [{ cellValue: '=HF.CONCAT(,"a")' }],
      [{ cellValue: '=HF.CONCAT(,)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('hokuspokusczarymary')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('a')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('')
  })

  it('should coerce to correct types', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.CONCAT(TRUE(),B1)' }],
      [{ cellValue: '=HF.CONCAT(1,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('TRUE')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1')
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.CONCAT(NA(),)' }],
      [{ cellValue: '=HF.CONCAT(B2:C2,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
