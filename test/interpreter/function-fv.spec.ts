import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FV', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FV(1,1)' }, { cellValue: '=FV(1, 1, 1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FV(2%, 24, 100)' }, { cellValue: '=FV(2%, 24, 100, 400)' }, { cellValue: '=FV(2%, 24, 100, 400, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-3042.18624737613)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-3685.56114716622)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(-3746.40487211374)
  })
})
