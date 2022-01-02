import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LCM', () => {
  it('checks required number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('computes correct answer for two args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(2*3*5,3*5*7)' }, { cellValue: '=LCM(0,1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(2 * 3 * 5 * 7)
    expect(engine.getCellValue(adr('B1'))).toBe(0)
  })

  it('computes correct answer for more than two args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(2*3*5,3*5*7, 2*5*7)' }, { cellValue: '=LCM(100,101,102,103, 104)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(2 * 3 * 5 * 7)
    expect(engine.getCellValue(adr('B1'))).toBe(1379437800)
  })

  it('works with zeroes', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(2*3*5,3*5*7, 2*5*7, 0, 0, 0)' }, { cellValue: '=LCM(0, 0, 100,101,102,103,104, 0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(0)
    expect(engine.getCellValue(adr('B1'))).toBe(0)
  })

  it('accepts single arg', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(1)' }, { cellValue: '=LCM(0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(1)
    expect(engine.getCellValue(adr('B1'))).toBe(0)
  })

  it('handles overflow', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(1000000,1000001,1000002,1000003)' }],
    ])

    //inconsistency with product #1
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('coerces to number', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM("4",2)' }],
      ['=LCM(B2:C2)', '\'4', 2],
      [{ cellValue: '=LCM(FALSE(),4)' }],
      [{ cellValue: '=LCM(B4:C4)' }, { cellValue: false }, { cellValue: 4 }],
      [{ cellValue: '=LCM(,4)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(4)
    expect(engine.getCellValue(adr('A2'))).toBe(4)
    expect(engine.getCellValue(adr('A3'))).toBe(0)
    expect(engine.getCellValue(adr('A4'))).toBe(0)
    expect(engine.getCellValue(adr('A5'))).toBe(0)
  })

  it('ignores non-coercible values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(B1:C1)' }, { cellValue: 'abcd' }, { cellValue: 4 }],
      [{ cellValue: '=LCM(B2:C2)' }, { cellValue: null }, { cellValue: 4 }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(4)
    expect(engine.getCellValue(adr('A2'))).toBe(4)
  })

  it('throws error for non-coercible values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM("abcd",4)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(-1,5)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('truncates numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      ['=LCM(B1:C1)', 5.5, 10],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(10)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LCM(NA(),4)' }],
      [{ cellValue: '=LCM(B2:C2)' }, { cellValue: '=NA()' }, { cellValue: 4 }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA))
  })
})
