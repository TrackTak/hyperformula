import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MEDIAN', () => {
  it('single number', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(1)
  })

  it('two numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(1.5)
  })

  it('more numbers (odd)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(3, 1, 2, 5, 7)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(3)
  })

  it('more numbers (even)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(3, 4, 1, 2, 5, 7)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(3.5)
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '3' }, { cellValue: '5' }, { cellValue: '1' }],
      [{ cellValue: '=MEDIAN(A1:C1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(3)
  })

  it('propagates error from regular argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3/0' }, { cellValue: '=MEDIAN(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('propagates first error from range argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3/0' }, { cellValue: '=FOO(' }, { cellValue: '=MEDIAN(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('return error when no arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('coerces only explicit arguments, ignores provided via reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="12"' }, { cellValue: '="11"' }, { cellValue: '="13"' }, { cellValue: '=MEDIAN(A1:C1)'}],
      [{ cellValue: '=MEDIAN(TRUE())' }],
      [{ cellValue: '=MEDIAN(1,2,3,B3:C3)' }],
    ])

    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.OneValue))
    expect(engine.getCellValue(adr('A2'))).toEqual(1)
    expect(engine.getCellValue(adr('A3'))).toEqual(2)
  })

  it('ignores nonnumeric values as long as theres at least one numeric value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(TRUE(), "foobar", 42)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('coerces given string arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN("12", "11", "13")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(12)
  })

  it('empty args as 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MEDIAN(1,2,3,,)' }],
      [{ cellValue: '=MEDIAN(,)' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(1)
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
  })
})
