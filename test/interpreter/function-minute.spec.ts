import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MINUTE', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=MINUTE("foo")' }, { cellValue: '=MINUTE("12/30/2018")' }, { cellValue: '=MINUTE(1, 2)' }, { cellValue: '=MINUTE()'}]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=MINUTE(0.5123456)' }, { cellValue: '=MINUTE(0)' }, { cellValue: '=MINUTE(0.999999)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(17)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=MINUTE("14:42:59")' }, { cellValue: '=MINUTE("01/01/1900 03:01:02am")' }, { cellValue: '=MINUTE("31/12/2018")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(42)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MINUTE(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MINUTE(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
