import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function POWER', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(101)' }],
      [{ cellValue: '=POWER(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(1, "foo")' }],
      [{ cellValue: '=POWER("bar", 4)' }],
      [{ cellValue: '=POWER("foo", "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return 1 for 0^0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(0, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('should return error for 0^N where N<0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(0, -2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('should return error when result too large or too small', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(2, 1023)' }],
      [{ cellValue: '=POWER(2, 1024)' }],
      [{ cellValue: '=POWER(-2, 1023)' }],
      [{ cellValue: '=POWER(-2, 1024)' }],
    ], {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(8.98846567431158e+307)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(-8.98846567431158e+307)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=POWER(0, 1)' }],
      [{ cellValue: '=POWER(2, 0)' }],
      [{ cellValue: '=POWER(2.4, 2.5)' }],
      [{ cellValue: '=POWER(3, -2.5)' }],
    ], {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(8.923353629661888)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0.06415002990995841)
  })
})
