import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function BETA.DIST', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST(1, 2, 3)' }],
      [{ cellValue: '=BETA.DIST(1, 2, 3, 4, 5, 6, 7)' }],
    ])

    //product #1 returns 1
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST("foo", 2, 3, TRUE())' }],
      [{ cellValue: '=BETA.DIST(1, "baz", 3, TRUE())' }],
      [{ cellValue: '=BETA.DIST(1, 2, "baz", TRUE())' }],
      [{ cellValue: '=BETA.DIST(1, 2, 3, "abcd")' }],
      [{ cellValue: '=BETA.DIST(1, 2, 3, TRUE(), "a", 2)' }],
      [{ cellValue: '=BETA.DIST(1, 2, 3, TRUE(), 1, "b")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST(0.1, 1, 2, TRUE())' }],
      [{ cellValue: '=BETA.DIST(0.5, 2, 4, TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.19, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.8125, 6)
  })

  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST(0.1, 1, 2, FALSE())' }],
      [{ cellValue: '=BETA.DIST(0.5, 2, 4, FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.8, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.25, 6)
  })

  it('scaling works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST(1.2, 1, 2, TRUE(), 1, 3)' }],
      [{ cellValue: '=BETA.DIST(15, 2, 4, TRUE(), 10, 20)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.19, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.8125, 6)
  })

  //product #1 returns 0 for tests 1,2,4,5
  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BETA.DIST(0, 1, 1, FALSE())' }],
      [{ cellValue: '=BETA.DIST(1, 0, 1, FALSE())' }],
      [{ cellValue: '=BETA.DIST(1, 1, 0, FALSE())' }],
      [{ cellValue: '=BETA.DIST(0.6, 1, 1, FALSE(), 0.6, 0.7)' }],
      [{ cellValue: '=BETA.DIST(0.7, 1, 1, FALSE(), 0.6, 0.7)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
