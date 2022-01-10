import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISPMT', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISPMT(1,1,1)' }, { cellValue: '=ISPMT(1, 1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISPMT(1, 1, 10, 1)' }, { cellValue: '=ISPMT(1, 1, 0, 1)' }, { cellValue: '=ISPMT(1, -1, 1, 1)' }, { cellValue: '=ISPMT(-1, -1, 1, -1)'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-0.9)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(-2)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(-2)
  })
})
