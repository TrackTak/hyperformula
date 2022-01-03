import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function WEEKNUM', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM(1, 2, 3)' }],
      [{ cellValue: '=WEEKNUM()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM("foo", 1)' }],
      [{ cellValue: '=WEEKNUM(2, "bar")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should not work for wrong value of args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM(-1, 1)' }],
      [{ cellValue: '=WEEKNUM(2, 9)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.BadMode))
  })

  it('should work for strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM("02/08/2020")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "1")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "21")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "21")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(31)
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM(0)' }],
      [{ cellValue: '=WEEKNUM(0, 1)' }],
      [{ cellValue: '=WEEKNUM(0, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(52)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(53)
  })

  it('should work for strings with different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM("02/08/2020")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "1")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "21")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "21")' }],
    ], {nullDate: {day: 20, month: 10, year: 1920}})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(31)
  })

  it('should work for strings with compatibility mode', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM("02/08/2020")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "1")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "21")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "21")' }],
    ], {leapYear1900: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(31)
  })
  it('should work for strings with compatibility mode and different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKNUM("02/08/2020")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "1")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2020", "21")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "2")' }],
      [{ cellValue: '=WEEKNUM("02/08/2017", "21")' }],
    ], {leapYear1900: true, nullDate: {day: 20, month: 10, year: 1920}})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(31)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(31)
  })

  it('big test', () => {
    const args = [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 11 }, { cellValue: 12}, {cellValue: 13 }, { cellValue: 14 }, { cellValue: 15 }, { cellValue: 16 }, { cellValue: 17 }, { cellValue: 21 }]
    const dates = [{ cellValue: '13/08/2020' }, { cellValue: '14/08/2020' }, { cellValue: '15/08/2020' }, { cellValue: '16/08/2020'}, {cellValue: '17/08/2020' }, { cellValue: '18/08/2020' }, { cellValue: '19/08/2020' }]
    const arrs = []
    for (const arg of args) {
      const arr = []
      for (const date of dates) {
        arr.push({ cellValue: `=WEEKNUM("${date}", ${arg})` })
      }
      arrs.push(arr)
    }
    const [engine] = HyperFormula.buildFromArray(arrs)
    expect(engine.getSheetValues(0)).toEqual(
      [[{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 34}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 33}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 33}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 33}, {cellValue: 33 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 33}, {cellValue: 33 }, { cellValue: 33 }, { cellValue: 34 }],
        [{ cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }, { cellValue: 34}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 34 }, { cellValue: 34 }, { cellValue: 34}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 34 }, { cellValue: 34}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 34}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
        [{ cellValue: 33 }, { cellValue: 33 }, { cellValue: 33 }, { cellValue: 33}, {cellValue: 34 }, { cellValue: 34 }, { cellValue: 34 }],
      ])
  })
})
