import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function TBILLEQ', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TBILLEQ(1,1)' }, { cellValue: '=TBILLEQ(1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TBILLEQ(0, 100, 0.1)' }],
      [{ cellValue: '=TBILLEQ(0, 360, 0.1)' }, { cellValue: '=TBILLEQ(0, 183, 0.1)' }],
      [{ cellValue: '=TBILLEQ(0, 180, 1.9)'}, { cellValue: '=TBILLEQ(0, 180, 2)'}, { cellValue: '=TBILLEQ(0, 180, 2.1)', }],
      [{ cellValue: '=TBILLEQ("1/2/2000", "31/1/2001", 0.1)' }, { cellValue: '=TBILLEQ(0, 365, 0.1)' }],
      [{ cellValue: '=TBILLEQ("28/2/2003", "29/2/2004", 0.1)' }],
      [{ cellValue: '=TBILLEQ(2, 2.1, 0.1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.104285714285714, 6)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
    //inconsistency with products #1 & #2
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.112654320987654, 6)
    //inconsistency with products #1 & #2
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(0.106818846941762, 6)
    //inconsistency with product #1 (returns #NUM!)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(38.5277777777778, 6)
    //inconsistency with product #1 (returns #NUM!)
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C3')).cellValue).toEqualError(detailedError(ErrorType.NUM))
    //inconsistency with products #1 & #2
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(0.112828438948995, 6)
    //inconsistency with products #1 & #2
    expect(engine.getCellValue(adr('B4')).cellValue).toBeCloseTo(0.112828438948995, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM))
  })
})
