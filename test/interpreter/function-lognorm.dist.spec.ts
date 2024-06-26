import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LOGNORM.DIST', () => {
  //in product #1, this function takes 3 arguments
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOGNORM.DIST(1, 2, 3)' }],
      [{ cellValue: '=LOGNORM.DIST(1, 2, 3, 4, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  //in product #1, this function takes 3 arguments
  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOGNORM.DIST("foo", 2, 3, TRUE())' }],
      [{ cellValue: '=LOGNORM.DIST(1, "baz", 3, TRUE())' }],
      [{ cellValue: '=LOGNORM.DIST(1, 2, "baz", TRUE())' }],
      [{ cellValue: '=LOGNORM.DIST(1, 2, 3, "abcd")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  //in product #1, this function takes 3 arguments
  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOGNORM.DIST(0.1, 1, 2, TRUE())' }],
      [{ cellValue: '=LOGNORM.DIST(0.5, 2, 4, TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.0493394267528022, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.250382425968177, 6)
  })

  //in product #1, this function takes 3 arguments
  it('should work as pdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOGNORM.DIST(0.1, 1, 2, FALSE())' }],
      [{ cellValue: '=LOGNORM.DIST(0.5, 2, 4, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.510234855730895, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.159017142514074, 6)
  })

  //in product #1, this function takes 3 arguments
  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOGNORM.DIST(0.01, 0, 0.01, FALSE())' }],
      [{ cellValue: '=LOGNORM.DIST(0, 0, 0.01, FALSE())' }],
      [{ cellValue: '=LOGNORM.DIST(0.01, 0, 0, FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
