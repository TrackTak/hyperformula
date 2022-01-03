import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function TBILLYIELD', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TBILLYIELD(1,1)' }, { cellValue: '=TBILLYIELD(1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TBILLYIELD(0, 100, 10)' }],
      [{ cellValue: '=TBILLYIELD(0, 360, 10)' }, { cellValue: '=TBILLYIELD(0, 183, 10)' }],
      [{ cellValue:'=TBILLYIELD(0, 180, 10)'}, { cellValue:'=TBILLYIELD(0, 180, 100)'}, { cellValue:'=TBILLYIELD(0, 180, 110)'}, ],
      [{ cellValue: '=TBILLYIELD("1/2/2000", "31/1/2001", 10)' }, { cellValue: '=TBILLYIELD(0, 365, 10)' }],
      [{ cellValue: '=TBILLYIELD("28/2/2003", "29/2/2004", 10)' }],
      [{ cellValue: '=TBILLYIELD(2, 2.1, 10)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(32.4, 6)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(17.7049180327869, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(18)
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C3')).cellValue).toBeCloseTo(-0.181818181818182, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(8.87671232876712, 6)
    expect(engine.getCellValue(adr('B4')).cellValue).toBeCloseTo(8.87671232876712, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM))
  })
})
