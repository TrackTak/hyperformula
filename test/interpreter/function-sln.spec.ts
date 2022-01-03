import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SLN', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SLN(1,1)' }, { cellValue: '=SLN(1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SLN(1, 2, 1)' }, { cellValue: '=SLN(2, 1, -2)' }, { cellValue: '=SLN(3, 2, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-1)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-0.5)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
