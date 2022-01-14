import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function T.DIST', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST(1, 2)' }],
      [{ cellValue: '=T.DIST(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST("foo", 2, TRUE())' }],
      [{ cellValue: '=T.DIST(1, "baz", TRUE())' }],
      [{ cellValue: '=T.DIST(1, 2, "abcd")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST(1, 1, TRUE())' }],
      [{ cellValue: '=T.DIST(3, 2, TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.75, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.952267016866645, 6)
  })

  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST(1, 1, FALSE())' }],
      [{ cellValue: '=T.DIST(3, 2, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.159154942198517, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0274101222343421, 6)
  })

  it('should truncate input', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST(1, 1.9, TRUE())' }],
      [{ cellValue: '=T.DIST(3, 2.9, TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.75, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.952267016866645, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST(-1, 1, FALSE())' }],
      [{ cellValue: '=T.DIST(1, 0.9, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.159154942198517)
    //product #2 returns different error
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
