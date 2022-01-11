import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MROUND', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(101)' }],
      [{ cellValue: '=MROUND(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(1, "foo")' }],
      [{ cellValue: '=MROUND("bar", 4)' }],
      [{ cellValue: '=MROUND("foo", "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return 0 when dividing by 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(42, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('should return error for args of different signs', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(42, -1)' }],
      [{ cellValue: '=MROUND(-42, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DistinctSigns))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(5, 2)' }],
      [{ cellValue: '=MROUND(36, 6.5)' }],
      [{ cellValue: '=MROUND(10.5, 3)' }],
      [{ cellValue: '=MROUND(-5, -2)' }],
      [{ cellValue: '=MROUND(-36, -6.5)' }],
      [{ cellValue: '=MROUND(-10.5, -3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(39)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(-39)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(-12)
  })

  /**
   * Tests below are results of how floating point arithmetic works.
   * This behavior is undefined, and this is test for consistency between platforms.
   * If this test starts throwing errors, it should be disabled.
   */
  it('known limitations', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MROUND(6.05, 0.1)' }],
      [{ cellValue: '=MROUND(7.05, 0.1)' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(7.1)
  })
})
