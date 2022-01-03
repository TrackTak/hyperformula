import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CUMIPMT', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CUMIPMT(1,1,1,1,1)' }, { cellValue: '=CUMIPMT(1, 1, 1, 1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CUMIPMT(1.1%, 12, 100, 1, 5, 0)' }, { cellValue: '=CUMIPMT(1.1%, 12, 100, 1, 5, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-4.6279374617215)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-3.4895523854812)
  })
})
