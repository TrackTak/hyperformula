import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DATEVALUE', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATEVALUE("foo")' }, { cellValue: '=DATEVALUE(1)' }, { cellValue: '=DATEVALUE(1, 2)' }, { cellValue: '=DATEVALUE()'}]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IncorrectDateTime))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IncorrectDateTime))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATEVALUE("31/12/1899")' }, { cellValue: '=DATEVALUE("01/01/1900")' }, { cellValue: '=DATEVALUE("31/12/2018")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(43465)
  })

  it('ignores time', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATEVALUE("2:00pm")' }, { cellValue: '=DATEVALUE("31/12/2018 2:00pm")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(43465)
  })

  it('border case', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATEVALUE("25:00")' }, { cellValue: '=DATEVALUE("31/12/2018 25:00")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(43466)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEVALUE(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
