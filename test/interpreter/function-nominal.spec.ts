import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NOMINAL', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NOMINAL(1)' }, { cellValue: '=NOMINAL(1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NOMINAL(2%, 1)' }, { cellValue: '=NOMINAL(2%, 2)' }, { cellValue: '=NOMINAL(2%, 2.9)' }, { cellValue: '=NOMINAL(2%, 24)'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.02, 9)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.0199009876724157, 9)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(0.0199009876724157, 9)
    expect(engine.getCellValue(adr('D1')).cellValue).toBeCloseTo(0.0198107992112657, 9)
  })
})
