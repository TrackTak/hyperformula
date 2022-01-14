import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function QUOTIENT', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=QUOTIENT(101)' }],
      [{ cellValue: '=QUOTIENT(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=QUOTIENT(1, "foo")' }],
      [{ cellValue: '=QUOTIENT("bar", 4)' }],
      [{ cellValue: '=QUOTIENT("foo", "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return error when dividing by 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=QUOTIENT(42, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=QUOTIENT(5, 2)' }],
      [{ cellValue: '=QUOTIENT(36, 6.1)' }],
      [{ cellValue: '=QUOTIENT(10.5, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
  })

  it('should work for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=QUOTIENT(-5, 2)' }],
      [{ cellValue: '=QUOTIENT(5, -2)' }],
      [{ cellValue: '=QUOTIENT(-5, -2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })
})
