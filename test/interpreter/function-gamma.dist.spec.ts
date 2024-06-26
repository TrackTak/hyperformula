import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function GAMMA.DIST', () => {

  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.DIST(1, 2, 3)' }],
      [{ cellValue: '=GAMMA.DIST(1, 2, 3, 4, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.DIST("foo", 2, 3, TRUE())' }],
      [{ cellValue: '=GAMMA.DIST(1, "baz", 3, TRUE())' }],
      [{ cellValue: '=GAMMA.DIST(1, 2, "baz", TRUE())' }],
      [{ cellValue: '=GAMMA.DIST(1, 2, 3, "abcd")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.DIST(1, 1, 2, TRUE())' }],
      [{ cellValue: '=GAMMA.DIST(3, 2, 4, TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.393469340287367, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.173358532703224, 6)
  })

  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.DIST(1, 1, 2, FALSE())' }],
      [{ cellValue: '=GAMMA.DIST(3, 2, 4, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.303265329856317, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0885687286389403, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.DIST(0, 1, 1, FALSE())' }],
      [{ cellValue: '=GAMMA.DIST(-0.00001, 1, 1, FALSE())' }],
      [{ cellValue: '=GAMMA.DIST(1, 0, 1, FALSE())' }],
      [{ cellValue: '=GAMMA.DIST(1, 1, 0, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
