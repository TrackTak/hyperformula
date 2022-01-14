import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function GAMMA', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA()' }],
      [{ cellValue: '=GAMMA(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA(1)' }],
      [{ cellValue: '=GAMMA(0.5)' }],
      [{ cellValue: '=GAMMA(10.5)' }],
      [{ cellValue: '=GAMMA(-2.5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.77245385588014, 6)
    expect(engine.getCellValue(adr('A3')).cellValue as number / 1133278.39212948).toBeCloseTo(1, 6)
    //product #1 returns NUM for the following test
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(-0.94530871782981, 6)
  })

  it('should return nan', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA(0)' }],
      [{ cellValue: '=GAMMA(-1)' }],
      [{ cellValue: '=GAMMA(180)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })
})
