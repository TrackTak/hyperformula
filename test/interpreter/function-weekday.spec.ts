import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function WEEKDAY', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY(1, 2, 3)' }],
      [{ cellValue: '=WEEKDAY()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY("foo", 1)' }],
      [{ cellValue: '=WEEKDAY(2, "bar")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should not work for wrong value of args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY(-1, 1)' }],
      [{ cellValue: '=WEEKDAY(2, 9)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.BadMode))
  })

  it('should work for strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY("31/07/2020")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "1")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "2")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "3")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(6)
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
    expect(engine.getCellValue(adr('A4'))).toEqual(4)
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY(0)' }],
      [{ cellValue: '=WEEKDAY(0, 1)' }],
      [{ cellValue: '=WEEKDAY(0, 2)' }],
      [{ cellValue: '=WEEKDAY(0, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(7)
    expect(engine.getCellValue(adr('A2'))).toEqual(7)
    expect(engine.getCellValue(adr('A3'))).toEqual(6)
    expect(engine.getCellValue(adr('A4'))).toEqual(5)
  })

  it('should work for strings with different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY("31/07/2020")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "1")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "2")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "3")' }],
    ], {nullDate: {day: 20, month: 10, year: 1920}})

    expect(engine.getCellValue(adr('A1'))).toEqual(6)
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
    expect(engine.getCellValue(adr('A4'))).toEqual(4)
  })

  it('should work for strings with compatibility mode', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY("31/07/2020")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "1")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "2")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "3")' }],
    ], {leapYear1900: true})

    expect(engine.getCellValue(adr('A1'))).toEqual(6)
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
    expect(engine.getCellValue(adr('A4'))).toEqual(4)
  })

  it('should work for strings with compatibility mode and different nullDate', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WEEKDAY("31/07/2020")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "1")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "2")' }],
      [{ cellValue: '=WEEKDAY("31/07/2020", "3")' }],
    ], {leapYear1900: true, nullDate: {day: 20, month: 10, year: 1920}})

    expect(engine.getCellValue(adr('A1'))).toEqual(6)
    expect(engine.getCellValue(adr('A2'))).toEqual(6)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
    expect(engine.getCellValue(adr('A4'))).toEqual(4)
  })

  it('big test', () => {
    const args = [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 11}, {cellValue: 12 }, { cellValue: 13 }, { cellValue: 14 }, { cellValue: 15 }, { cellValue: 16 }, { cellValue: 17 }]
    const dates = [{ cellValue: '13/08/2020' }, { cellValue: '14/08/2020' }, { cellValue: '15/08/2020' }, { cellValue: '16/08/2020'}, {cellValue: '17/08/2020' }, { cellValue: '18/08/2020' }, { cellValue: '19/08/2020' }]
    const arrs = []
    for (const arg of args) {
      const arr = []
      for (const date of dates) {
        arr.push(`=WEEKDAY("${date}", ${arg})`)
      }
      arrs.push(arr)
    }
    const [engine] = HyperFormula.buildFromArray(arrs)
    expect(engine.getSheetValues(0)).toEqual(
      [[{ cellValue: 5 }, { cellValue: 6 }, { cellValue: 7 }, { cellValue: 1}, {cellValue: 2 }, { cellValue: 3 }, { cellValue: 4 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: 5 }, { cellValue: 6}, {cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }, { cellValue: 7}, {cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 3 }, { cellValue: 4 }, { cellValue: 5 }, { cellValue: 6}, {cellValue: 7 }, { cellValue: 1 }, { cellValue: 2 }],
        [{ cellValue: 2 }, { cellValue: 3 }, { cellValue: 4 }, { cellValue: 5}, {cellValue: 6 }, { cellValue: 7 }, { cellValue: 1 }],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }, { cellValue: 6 }, { cellValue: 7 }],
        [{ cellValue: 7 }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 6 }, { cellValue: 7 }, { cellValue: 1 }, { cellValue: 2}, {cellValue: 3 }, { cellValue: 4 }, { cellValue: 5 }],
        [{ cellValue: 5 }, { cellValue: 6 }, { cellValue: 7 }, { cellValue: 1}, {cellValue: 2 }, { cellValue: 3 }, { cellValue: 4 }]])
  })
})
