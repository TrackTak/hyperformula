import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function OCT2DEC', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-oct arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC("foo")' }],
      [{ cellValue: '=OCT2DEC(418)' }],
      [{ cellValue: '=OCT2DEC(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC(1)' }],
      [{ cellValue: '=OCT2DEC(10)' }],
      [{ cellValue: '=OCT2DEC(71)' }],
      [{ cellValue: '=OCT2DEC(12345)' }],
      [{ cellValue: '=OCT2DEC(4242565)' }],
      [{ cellValue: '=OCT2DEC(1234567654)' }],
      [{ cellValue: '=OCT2DEC(7777777000)' }],
      [{ cellValue: '=OCT2DEC(7777777042)' }],
      [{ cellValue: '=OCT2DEC(7777777777)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(8)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(57)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5349)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(1131893)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(175304620)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(-512)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(-478)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(-1)
  })

  it('should work for strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC("456")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(302)
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="123"' }],
      [{ cellValue: '=OCT2DEC(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(83)
  })

  it('should return a number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC(11)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.NUMBER)
  })

  it('should work only for 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2DEC(10107040205)' }],
      [{ cellValue: '=OCT2DEC(7777777042)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-478)
  })
})
