import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function T.DIST.2T', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST.2T(1)' }],
      [{ cellValue: '=T.DIST.2T(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST.2T("foo", 2)' }],
      [{ cellValue: '=T.DIST.2T(1, "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work as cdf', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST.2T(1, 1)' }],
      [{ cellValue: '=T.DIST.2T(3, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.5, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0954659662667092, 6)
  })

  it('should truncate input', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST.2T(1, 1.9)' }],
      [{ cellValue: '=T.DIST.2T(3, 2.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.5, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0954659662667092, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.DIST.2T(0, 1)' }],
      [{ cellValue: '=T.DIST.2T(-0.01, 1)' }],
      [{ cellValue: '=T.DIST.2T(1, 0.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
