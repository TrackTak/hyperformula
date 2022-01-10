import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HF.GT', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.GT(1)' }, { cellValue: '=HF.GT(1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.GT(1,0)' }],
      [{ cellValue: '=HF.GT(1,1)' }],
      [{ cellValue: '=HF.GT("1","0")' }],
      [{ cellValue: '=HF.GT("1","1")' }],
      [{ cellValue: '=HF.GT(TRUE(),FALSE())' }],
      [{ cellValue: '=HF.GT(TRUE(),TRUE())' }],
      [{ cellValue: '=HF.GT(,)' }],
      [{ cellValue: '=HF.GT(1,)' }],
      [{ cellValue: '=HF.GT("1",)' }],
      [{ cellValue: '=HF.GT(TRUE(),)' }],
      [{ cellValue: '=HF.GT("1",1)' }],
      [{ cellValue: '=HF.GT(TRUE(),1)' }],
      [{ cellValue: '=HF.GT(TRUE(),"1")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('A13')).cellValue).toEqual(true)
  })

  it('should throw correct error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HF.GT(NA(),)' }],
      [{ cellValue: '=HF.GT(B2:C2,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
