import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function WORKDAY', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=WORKDAY(1)' }, { cellValue: '=WORKDAY(1, 1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works correctly for first two arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=WORKDAY(1000, 1)' }],
      [{ cellValue: '=WORKDAY(1000.9, 1.9)' }],
      [{ cellValue: '=WORKDAY(1000.9, -1)' }],
      [{ cellValue: '=WORKDAY(1000, -1.9)' }],
      [{ cellValue: '=WORKDAY(1000, 0)' }],
      [{ cellValue: '=WORKDAY(1000, 0.9)' }],
      [{ cellValue: '=WORKDAY(1000, -0.9)' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1003)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1003)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(999)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(999)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(1000)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(1000)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(1000)
  })

  it('this year', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '29/09/2020' }, { cellValue: '=A1+0.1' }, { cellValue: '31/12/2019' }, { cellValue: '01/01/2021'}, {cellValue: '27/09/2020' }],
      [{ cellValue: '=WORKDAY("01/01/2020", 262)' }],
      [{ cellValue: '=WORKDAY("01/01/2020", 262, A1:A1)' }],
      [{ cellValue: '=WORKDAY("01/01/2020", 262, A1:B1)' }],
      [{ cellValue: '=WORKDAY("01/01/2020", 262, A1:D1)' }],
      [{ cellValue: '=WORKDAY("01/01/2020", 262, A1:E1)' }],
    ]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(44197)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(44200)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(44200)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(44201)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(44201)
  })

  it('should output correct values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '01/01/2020' }, { cellValue: '=A1+5' }, { cellValue: '=A1+8' }, { cellValue: '=A1+9'}, {cellValue: '=A1+15' }, { cellValue: '=A1+18' }, { cellValue: '=A1+19' }, { cellValue: '=A1+32' }, { cellValue: '=A1+54' }, { cellValue: '=A1+55' }],
      [{ cellValue: '=WORKDAY(A1, 65, A1:J1)' }],
      [{ cellValue: '=WORKDAY(A1+7, 6, A1:J1)' }],
      [{ cellValue: '=WORKDAY(A1+7, 62, A1:J1)' }],
      [{ cellValue: '=WORKDAY(A1+13, 26, A1:J1)' }],
      [{ cellValue: '=WORKDAY(A1+50, 3, A1:J1)' }],
    ]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(43931)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(43852)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(43934)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(43882)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(43888)
  })

  it('checks types in last argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: true}, { cellValue: '\'1'}, { cellValue: null}, { cellValue: '=NA()'}],
      [{ cellValue: '=WORKDAY(1000, 1, A1:A1)' }],
      [{ cellValue: '=WORKDAY(1000, 1, B1:B1)' }],
      [{ cellValue: '=WORKDAY(1000, 1, C1:C1)' }],
      [{ cellValue: '=WORKDAY(1000, 1, A1:D1)' }],
    ]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1003)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
