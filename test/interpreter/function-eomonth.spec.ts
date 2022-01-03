import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType, SimpleCellAddress} from '../../src/Cell'
import {Config} from '../../src/Config'
import {ErrorMessage} from '../../src/error-message'
import {adr, dateNumberToString, detailedError} from '../testUtils'

const expectToHaveDate = (engine: HyperFormula, address: SimpleCellAddress, dateString: string) => {
  expect(dateNumberToString(engine.getCellValue(address).cellValue, new Config())).toEqual(dateString)
}

describe('Function EOMONTH', () => {
  it('validate arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 3, 31)' }],
      [{ cellValue: '=EOMONTH("foo", 0)' }],
      [{ cellValue: '=EOMONTH(A1, "bar")' }],
      [{ cellValue: '=EOMONTH(A1)' }],
      [{ cellValue: '=EOMONTH(A1, "bar", "baz")' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 3, 10)' }],
      [{ cellValue: '=EOMONTH(A1, 0)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/03/2019')
    expect(engine.getCellValueDetailedType(adr('A2'))).toBe(CellValueDetailedType.NUMBER_DATE)
  })

  it('works for exact end of month', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 3, 31)' }],
      [{ cellValue: '=EOMONTH(A1, 0)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/03/2019')
  })

  it('works for positive numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 7, 31)' }],
      [{ cellValue: '=EOMONTH(A1, 1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/08/2019')
  })

  it('works for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 8, 31)' }],
      [{ cellValue: '=EOMONTH(A1, -1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/07/2019')
  })

  it('works when next date will have more days', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 6, 30)' }],
      [{ cellValue: '=EOMONTH(A1, 1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/07/2019')
  })

  it('works when next date will have less days', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 1, 31)' }],
      [{ cellValue: '=EOMONTH(A1, 1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '28/02/2019')
  })

  it('works when previous date will have more days', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 2, 28)' }],
      [{ cellValue: '=EOMONTH(A1, -1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '31/01/2019')
  })

  it('works when previous date will have less days', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 3, 31)' }],
      [{ cellValue: '=EOMONTH(A1, -1)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '28/02/2019')
  })

  it('works for leap years', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2020, 2, 28)' }],
      [{ cellValue: '=EOMONTH(A1, 0)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '29/02/2020')
  })

  it('works for non-leap years', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 2, 28)' }],
      [{ cellValue: '=EOMONTH(A1, 0)' }],
    ])

    expectToHaveDate(engine, adr('A2'), '28/02/2019')
  })

  it('use number coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EOMONTH(TRUE(), 1)' }],
      [{ cellValue: '=EOMONTH(1, 1)' }],
    ])

    expectToHaveDate(engine, adr('A1'), '31/01/1900')
    expectToHaveDate(engine, adr('A2'), '31/01/1900')
  })

  it('use number coercion for 2nd argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DATE(2019, 3, 31)' }],
      [{ cellValue: '="1"' }, { cellValue: '=EOMONTH(A1, A2)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=EOMONTH(A1, A3)' }],
    ])

    expectToHaveDate(engine, adr('B2'), '30/04/2019')
    expectToHaveDate(engine, adr('B3'), '30/04/2019')
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EOMONTH(4/0, 0)' }],
      [{ cellValue: '=EOMONTH(0, 4/0)' }],
      [{ cellValue: '=EOMONTH(4/0, FOOBAR())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
