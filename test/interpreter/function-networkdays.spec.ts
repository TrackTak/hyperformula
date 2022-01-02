import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NETWORKDAYS', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NETWORKDAYS(1)' }, { cellValue: '=NETWORKDAYS(1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works correctly for first two arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NETWORKDAYS(0, 1)' }],
      [{ cellValue: '=NETWORKDAYS(0, 6)' }],
      [{ cellValue: '=NETWORKDAYS(0, 6.9)' }],
      [{ cellValue: '=NETWORKDAYS(6.9,0.1)' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual(0)
    expect(engine.getCellValue(adr('A2'))).toEqual(5)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
    expect(engine.getCellValue(adr('A4'))).toEqual(-5)
  })

  it('this year', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '29/09/2020' }, { cellValue: '=A1+0.1' }, { cellValue: '31/12/2019' }, { cellValue: '01/01/2021'}, {cellValue: '27/09/2020' }],
      [{ cellValue: '=NETWORKDAYS("01/01/2020", "31/12/2020")' }],
      [{ cellValue: '=NETWORKDAYS("01/01/2020", "31/12/2020", A1:A1)' }],
      [{ cellValue: '=NETWORKDAYS("01/01/2020", "31/12/2020", A1:B1)' }],
      [{ cellValue: '=NETWORKDAYS("01/01/2020", "31/12/2020", A1:D1)' }],
      [{ cellValue: '=NETWORKDAYS("01/01/2020", "31/12/2020", A1:E1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqual(262)
    expect(engine.getCellValue(adr('A3'))).toEqual(261)
    expect(engine.getCellValue(adr('A4'))).toEqual(261)
    expect(engine.getCellValue(adr('A5'))).toEqual(261)
    expect(engine.getCellValue(adr('A6'))).toEqual(261)
  })

  it('should output correct values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '01/01/2020' }, { cellValue: '=A1+5' }, { cellValue: '=A1+8' }, { cellValue: '=A1+9'}, {cellValue: '=A1+15' }, { cellValue: '=A1+18' }, { cellValue: '=A1+19' }, { cellValue: '=A1+32' }, { cellValue: '=A1+54' }, { cellValue: '=A1+55' }],
      [{ cellValue: '=NETWORKDAYS(A1, A1+100, A1:J1)' }],
      [{ cellValue: '=NETWORKDAYS(A1+7, A1+20, A1:J1)' }],
      [{ cellValue: '=NETWORKDAYS(A1+7, A1+100, A1:J1)' }],
      [{ cellValue: '=NETWORKDAYS(A1+13, A1+50, A1:J1)' }],
      [{ cellValue: '=NETWORKDAYS(A1+50, A1+56, A1:J1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqual(65)
    expect(engine.getCellValue(adr('A3'))).toEqual(6)
    expect(engine.getCellValue(adr('A4'))).toEqual(62)
    expect(engine.getCellValue(adr('A5'))).toEqual(26)
    expect(engine.getCellValue(adr('A6'))).toEqual(3)
  })

  it('checks types in last argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [true, '\'1', null, '=NA()'],
      [{ cellValue: '=NETWORKDAYS(1000, 1, A1:A1)' }],
      [{ cellValue: '=NETWORKDAYS(1000, 1, B1:B1)' }],
      [{ cellValue: '=NETWORKDAYS(1000, 1, C1:C1)' }],
      [{ cellValue: '=NETWORKDAYS(1000, 1, A1:D1)' }],
    ])
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A4'))).toEqual(-715)
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.NA))
  })
})
