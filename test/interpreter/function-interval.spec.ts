import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function INTERVAL', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=INTERVAL("foo")' }, { cellValue: '=INTERVAL("12/30/2018")' }, { cellValue: '=INTERVAL(1, 2)' }, { cellValue: '=INTERVAL()'}]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=INTERVAL(0)' }, { cellValue: '=INTERVAL(10000000)' }, { cellValue: '=INTERVAL(365.1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('PT')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('P3M25DT17H46M40S')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('PT6M5S')
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=INTERVAL("31/12/1899")' }, { cellValue: '=INTERVAL("01/01/1900")' }, { cellValue: '=INTERVAL("31/12/2018")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('PT1S')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('PT2S')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('PT12H4M25S')
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INTERVAL(TRUE())' }],
      [{ cellValue: '=INTERVAL("1")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('PT1S')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('PT1S')
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INTERVAL(NA())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
