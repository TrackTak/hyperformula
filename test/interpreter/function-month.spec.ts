import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MONTH', () => {
  it('with wrong arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MONTH("foo")' }, { cellValue: '=MONTH("12/30/2018")' }, { cellValue: '=MONTH(1, 2)' }, { cellValue: '=MONTH()'}]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MONTH(0)' }, { cellValue: '=MONTH(2)' }, { cellValue: '=MONTH(43465)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(12)
  })

  it('with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MONTH("31/12/1899")' }, { cellValue: '=MONTH("01/01/1900")' }, { cellValue: '=MONTH("31/12/2018")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(12)
  })

  it('use datenumber coercion for 1st argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(TRUE())' }],
      [{ cellValue: '=MONTH(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(12)
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('test for days in month, start of month', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2021,1,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,2,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,3,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,4,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,5,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,6,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,7,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,8,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,9,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,10,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,11,1))' }],
      [{ cellValue: '=MONTH(DATE(2021,12,1))' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(12)
  })

  it('test for days in month, end of month', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2021,1,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,2,28))' }],
      [{ cellValue: '=MONTH(DATE(2021,3,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,4,30))' }],
      [{ cellValue: '=MONTH(DATE(2021,5,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,6,30))' }],
      [{ cellValue: '=MONTH(DATE(2021,7,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,8,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,9,30))' }],
      [{ cellValue: '=MONTH(DATE(2021,10,31))' }],
      [{ cellValue: '=MONTH(DATE(2021,11,30))' }],
      [{ cellValue: '=MONTH(DATE(2021,12,31))' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(12)
  })

  it('test for days in month, end of month+1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2021,1,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,2,28)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,3,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,4,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,5,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,6,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,7,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,8,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,9,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,10,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,11,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2021,12,31)+1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(1)
  })

  it('test for days in month, start of month, leap year', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2020,1,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,2,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,3,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,4,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,5,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,6,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,7,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,8,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,9,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,10,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,11,1))' }],
      [{ cellValue: '=MONTH(DATE(2020,12,1))' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(12)
  })

  it('test for days in month, end of month, leap year', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2020,1,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,2,29))' }],
      [{ cellValue: '=MONTH(DATE(2020,3,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,4,30))' }],
      [{ cellValue: '=MONTH(DATE(2020,5,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,6,30))' }],
      [{ cellValue: '=MONTH(DATE(2020,7,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,8,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,9,30))' }],
      [{ cellValue: '=MONTH(DATE(2020,10,31))' }],
      [{ cellValue: '=MONTH(DATE(2020,11,30))' }],
      [{ cellValue: '=MONTH(DATE(2020,12,31))' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(12)
  })

  it('test for days in month, end of month+1, leap year', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MONTH(DATE(2020,1,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,2,29)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,3,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,4,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,5,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,6,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,7,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,8,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,9,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,10,31)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,11,30)+1)' }],
      [{ cellValue: '=MONTH(DATE(2020,12,31)+1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(9)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(11)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual(1)
  })
})
