import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ERFC', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ERFC()' }],
      [{ cellValue: '=ERFC(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ERFC("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ERFC(0)' }],
      [{ cellValue: '=ERFC(2)' }],
      [{ cellValue: '=ERFC(0.5)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.004677734981047288, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.4795001221869535, 6)
  })

  it('should work for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ERFC(-10.123)' }],
      [{ cellValue: '=ERFC(-14.8)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(2)
  })
})
