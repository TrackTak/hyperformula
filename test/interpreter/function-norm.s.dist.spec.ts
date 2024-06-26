import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NORM.S.DIST', () => {
  //in product #1, this function takes 1 argument
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.DIST(2)' }],
      [{ cellValue: '=NORM.S.DIST(1, 4, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  //in product #1, this function takes 1 argument
  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.DIST("foo", TRUE())' }],
      [{ cellValue: '=NORM.S.DIST(1, "abcd")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  //in product #1, this function takes 1 argument
  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.DIST(-1, TRUE())' }],
      [{ cellValue: '=NORM.S.DIST(0.5, TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.158655253931457, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.691462461274013, 6)
  })

  //in product #1, this function takes 1 argument
  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.DIST(-1, FALSE())' }],
      [{ cellValue: '=NORM.S.DIST(0.5, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.241970724519143, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.3520653267643, 6)
  })
})
