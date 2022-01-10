import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NPER', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NPER(1,1)' }, { cellValue: '=NPER(1, 1, 1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NPER(1%, 1, 100, 1)' }, { cellValue: '=NPER(1%, 1, 100, 1, 1)' }, { cellValue: '=NPER(1%, 1, 100, 1, 2)' }],
      [{ cellValue: '=NPER(100%, -50, 100, 0, 1)' }, { cellValue: '=NPER(100%, -50, 100, -100, 1)' }, { cellValue: '=NPER(-100%, 1, 100, 1, 1)' }, { cellValue: '=NPER(-200%, 1, 100, 1, 1)'}],
      [{ cellValue: '=NPER(-20%, -50, 100, 300, 1)' }],
      [{ cellValue: '=NPER(0%, -50, 100, 300, 1)' }],
      [{ cellValue: '=NPER(0%, 0, 100, 100, 1)' }, { cellValue: '=NPER(0%, 0, 100, -100, 1)' }],
      [{ cellValue: '=NPER(1%, 0, 100, 100, 1)' }, { cellValue: '=NPER(1%, 0, 100, -50, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-70.67076731)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-70.16196068)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(-70.16196068)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('D2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B5')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('B6')).cellValue).toBeCloseTo(-69.66071689)
  })
})
