import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NORM.DIST', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NORM.DIST(1, 2, 3)' }],
      [{ cellValue: '=NORM.DIST(1, 2, 3, 4, 5)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NORM.DIST("foo", 2, 3, TRUE())' }],
      [{ cellValue: '=NORM.DIST(1, "baz", 3, TRUE())' }],
      [{ cellValue: '=NORM.DIST(1, 2, "baz", TRUE())' }],
      [{ cellValue: '=NORM.DIST(1, 2, 3, "abcd")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NORM.DIST(-1, 1, 2, TRUE())' }],
      [{ cellValue: '=NORM.DIST(0.5, 2, 4, TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.158655253931457, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.353830233327276, 6)
  })

  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NORM.DIST(-1, 1, 2, FALSE())' }],
      [{ cellValue: '=NORM.DIST(0.5, 2, 4, FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.120985362259572, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0929637734674423, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NORM.DIST(-1, -1, 0.01, FALSE())' }],
      [{ cellValue: '=NORM.DIST(-1, -1, 0, FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(39.8942280401433, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
