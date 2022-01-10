import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ERF', () => {

  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ERF()' }],
      [{ cellValue: '=ERF(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ERF("foo")' }],
      [{ cellValue: '=ERF(1, "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work for single argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ERF(0)' }],
      [{ cellValue: '=ERF(1)' }],
      [{ cellValue: '=ERF(3.14)' }],
      [{ cellValue: '=ERF(-2.56)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.9999910304344467, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(-0.999705836979508, 6)
  })

  it('should work with second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ERF(-2.3, -0.7)' }],
      [{ cellValue: '=ERF(-2.3, 2)' }],
      [{ cellValue: '=ERF(5.6, -3.1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.32105562956522493, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.9941790884215962, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-1.9999883513426304, 6)
  })
})
