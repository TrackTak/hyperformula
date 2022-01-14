import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SECOND', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECOND("foo")' }, { cellValue: '=SECOND("12/30/2018")' }, { cellValue: '=SECOND(1, 2)' }, { cellValue: '=SECOND()'}]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECOND(0.5123456)' }, { cellValue: '=SECOND(0)' }, { cellValue: '=SECOND(0.999999)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(47)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECOND("14:42:59")' }, { cellValue: '=SECOND("01/01/1900 03:01:02am")' }, { cellValue: '=SECOND("31/12/2018")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(59)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SECOND(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SECOND(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
