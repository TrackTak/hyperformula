import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function YEAR', () => {
  it('validate arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=YEAR(1, 2)' }],
      [{ cellValue: '=YEAR()' }],
      [{ cellValue: '=YEAR("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=YEAR(0)' }, { cellValue: '=YEAR(2)' }, { cellValue: '=YEAR(43465)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1899)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1900)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(2018)
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=YEAR("31/12/1899")' }, { cellValue: '=YEAR("01/01/1900")' }, { cellValue: '=YEAR("31/12/2018")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1899)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1900)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(2018)
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=YEAR(TRUE())' }],
      [{ cellValue: '=YEAR(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1899)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1899)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=YEAR(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
