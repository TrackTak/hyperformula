import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DB', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DB(1,1,1)' }, { cellValue: '=DB(1, 1, 1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const formulas = [
      ['=DB(10000,50,10,2,12)',
        '=DB(10000,50,10,2)',
        '=DB(10000,50,10,2,7)'],
      ['=DB(10000,50,10,1,12)',
        '=DB(10000,50,10,1,7)'],
      ['=DB(10000,50,10,10,12)',
        '=DB(10000,50,10,10,7)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray(formulas)

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(2420.79)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(2420.79)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(3124.63)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(4110.00)
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(2397.50)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(35.07)
    expect(engine.getCellValue(adr('B3')).cellValue).toBeCloseTo(45.26)
  })

  it('compatibility', () => {
    const formulas = [
      ['=DB(1000000,100000,6,7,7)',
        '=DB(1000000,100000,6,8,7)',
        '=DB(1000000,100000,6,7)', ],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray(formulas)
    //product #1 returns #NUM! instead of an actual value
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(15845.10)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.PeriodLong))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.PeriodLong))

  })
})
