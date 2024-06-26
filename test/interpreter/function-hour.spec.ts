import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HOUR', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=HOUR("foo")' }, { cellValue: '=HOUR("12/30/2018")' }, { cellValue: '=HOUR(1, 2)' }, { cellValue: '=HOUR()'}]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=HOUR(0.5123456)' }, { cellValue: '=HOUR(0)' }, { cellValue: '=HOUR(0.999999)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=HOUR("14:42:59")' }, { cellValue: '=HOUR("01/01/1900 03:01:02am")' }, { cellValue: '=HOUR("31/12/2018")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(14)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HOUR(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HOUR(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
