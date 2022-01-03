import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISOWEEKNUM', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM(1, 2)' }],
      [{ cellValue: '=ISOWEEKNUM()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should not work for wrong value of args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM(-1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('should work for strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM("02/08/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("02/08/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2016")' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(53)
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM(0)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(52)
  })

  it('should work for strings with different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM("02/08/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("02/08/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2016")' }],
    ], {nullDate: {day: 20, month: 10, year: 1920}})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(53)
  })

  it('should work for strings with compatibility mode', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM("02/08/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("02/08/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2016")' }],
    ], {leapYear1900: true})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(53)
  })
  it('should work for strings with compatibility mode and different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISOWEEKNUM("02/08/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("02/08/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2020")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2017")' }],
      [{ cellValue: '=ISOWEEKNUM("01/01/2016")' }],
    ], {leapYear1900: true, nullDate: {day: 20, month: 10, year: 1920}})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(53)
  })
})
