import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function WORKDAY.INTL', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WORKDAY.INTL(1)' }, { cellValue: '=WORKDAY.INTL(1, 1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should check for types or value of third argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WORKDAY.INTL(0, 1, TRUE())' }],
      [{ cellValue: '=WORKDAY.INTL(0, 1, "1")' }],
      [{ cellValue: '=WORKDAY.INTL(0, 1, "1010102")' }],
      [{ cellValue: '=WORKDAY.INTL(0, 1, -1)' }],
      [{ cellValue: '=WORKDAY.INTL(0, 1, "1111111")' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.WeekendString))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.WeekendString))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.BadMode))
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.WeekendString))
  })

  it('works correctly for first two arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WORKDAY.INTL(1000, 1)' }],
      [{ cellValue: '=WORKDAY.INTL(1000.9, 1.9)' }],
      [{ cellValue: '=WORKDAY.INTL(1000.9, -1)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, -1.9)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, 0)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, 0.9)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, -0.9)' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(1003)
    expect(engine.getCellValue(adr('A2'))).toEqual(1003)
    expect(engine.getCellValue(adr('A3'))).toEqual(999)
    expect(engine.getCellValue(adr('A4'))).toEqual(999)
    expect(engine.getCellValue(adr('A5'))).toEqual(1000)
    expect(engine.getCellValue(adr('A6'))).toEqual(1000)
    expect(engine.getCellValue(adr('A7'))).toEqual(1000)
  })

  it('today plus 1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 3)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 4)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 5)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 6)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 13)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 14)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, 15)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", 1, "1011111")' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(44104)
    expect(engine.getCellValue(adr('A2'))).toEqual(44104)
    expect(engine.getCellValue(adr('A3'))).toEqual(44105)
    expect(engine.getCellValue(adr('A4'))).toEqual(44106)
    expect(engine.getCellValue(adr('A5'))).toEqual(44104)
    expect(engine.getCellValue(adr('A6'))).toEqual(44104)
    expect(engine.getCellValue(adr('A7'))).toEqual(44105)
    expect(engine.getCellValue(adr('A8'))).toEqual(44104)
    expect(engine.getCellValue(adr('A9'))).toEqual(44110)
  })

  it('today minus 1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 2)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 3)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 4)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 5)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 12)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 13)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, 14)' }],
      [{ cellValue: '=WORKDAY.INTL("29/09/2020", -1, "1011111")' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(44102)
    expect(engine.getCellValue(adr('A2'))).toEqual(44100)
    expect(engine.getCellValue(adr('A3'))).toEqual(44101)
    expect(engine.getCellValue(adr('A4'))).toEqual(44102)
    expect(engine.getCellValue(adr('A5'))).toEqual(44102)
    expect(engine.getCellValue(adr('A6'))).toEqual(44101)
    expect(engine.getCellValue(adr('A7'))).toEqual(44102)
    expect(engine.getCellValue(adr('A8'))).toEqual(44102)
    expect(engine.getCellValue(adr('A9'))).toEqual(44096)
  })

  it('this year', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '29/09/2020' }, { cellValue: '=A1+0.1' }, { cellValue: '31/12/2019' }, { cellValue: '01/01/2021'}, {cellValue: '27/09/2020' }],
      [{ cellValue: '=WORKDAY.INTL("01/01/2020", 262, 1)' }],
      [{ cellValue: '=WORKDAY.INTL("01/01/2020", 262, 1, A1:A1)' }],
      [{ cellValue: '=WORKDAY.INTL("01/01/2020", 262, 1, A1:B1)' }],
      [{ cellValue: '=WORKDAY.INTL("01/01/2020", 262, 1, A1:D1)' }],
      [{ cellValue: '=WORKDAY.INTL("01/01/2020", 262, 1, A1:E1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqual(44197)
    expect(engine.getCellValue(adr('A3'))).toEqual(44200)
    expect(engine.getCellValue(adr('A4'))).toEqual(44200)
    expect(engine.getCellValue(adr('A5'))).toEqual(44201)
    expect(engine.getCellValue(adr('A6'))).toEqual(44201)
  })

  it('should output correct values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '01/01/2020' }, { cellValue: '=A1+5' }, { cellValue: '=A1+8' }, { cellValue: '=A1+9'}, {cellValue: '=A1+15' }, { cellValue: '=A1+18' }, { cellValue: '=A1+19' }, { cellValue: '=A1+32' }, { cellValue: '=A1+54' }, { cellValue: '=A1+55' }],
      [{ cellValue: '=WORKDAY.INTL(A1, 91, "0000000", A1:J1)' }],
      [{ cellValue: '=WORKDAY.INTL(A1+7, 9, "0000000", A1:J1)' }],
      [{ cellValue: '=WORKDAY.INTL(A1+7, 86, "0000000", A1:J1)' }],
      [{ cellValue: '=WORKDAY.INTL(A1+13, 34, "0000000", A1:J1)' }],
      [{ cellValue: '=WORKDAY.INTL(A1+50, 5, "0000000", A1:J1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqual(43931)
    expect(engine.getCellValue(adr('A3'))).toEqual(43852)
    expect(engine.getCellValue(adr('A4'))).toEqual(43932)
    expect(engine.getCellValue(adr('A5'))).toEqual(43882)
    expect(engine.getCellValue(adr('A6'))).toEqual(43888)
  })

  it('checks types in last argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [true, '\'1', null, '=NA()'],
      [{ cellValue: '=WORKDAY.INTL(1000, 1, 1, A1:A1)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, 1, 1, B1:B1)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, 1, 1, C1:C1)' }],
      [{ cellValue: '=WORKDAY.INTL(1000, 1, 1, A1:D1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A4'))).toEqual(1003)
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.NA))
  })
})
