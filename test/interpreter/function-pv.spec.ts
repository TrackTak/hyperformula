import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PV', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=PV(1,1)' }, { cellValue: '=PV(1, 1, 1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=PV(2%, 24, 100)' }, { cellValue: '=PV(2%, 24, 100, 400)' }, { cellValue: '=PV(2%, 24, 100, 400, 1)' }],
      [{ cellValue: '=PV(-99%, 24, 100)' }, { cellValue: '=PV(-1, 24, 100, 400)' }, { cellValue: '=PV(-2, 24, 100, 400, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-1891.39256, 6)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-2140.081155, 6)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(-2177.909007, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(-1.01010101010099e+50, 6)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C2')).cellValue).toBeCloseTo(-400, 6)
  })
})
