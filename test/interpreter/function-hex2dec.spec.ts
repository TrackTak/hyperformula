import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function HEX2DEC', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-hex arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC("foo")' }],
      [{ cellValue: '=HEX2DEC("23G")' }],
      [{ cellValue: '=HEX2DEC(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC("1")' }],
      [{ cellValue: '=HEX2DEC("10")' }],
      [{ cellValue: '=HEX2DEC("AD")' }],
      [{ cellValue: '=HEX2DEC("ABBA")' }],
      [{ cellValue: '=HEX2DEC("BA0AB")' }],
      [{ cellValue: '=HEX2DEC("B09D65")' }],
      [{ cellValue: '=HEX2DEC("F1808E4")' }],
      [{ cellValue: '=HEX2DEC("B07D007")' }],
      [{ cellValue: '=HEX2DEC("7FFFFFFFFF")' }],
      [{ cellValue: '=HEX2DEC("F352DEB731")' }],
      [{ cellValue: '=HEX2DEC("FFFFFFFFFF")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(16)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(173)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(43962)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(762027)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(11574629)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(253233380)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(185061383)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(549755813887)
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual(-54444247247)
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual(-1)
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC(456)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1110)
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="1A3"' }],
      [{ cellValue: '=HEX2DEC(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(419)
  })

  it('should return a number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC("11")' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.NUMBER)
  })

  it('should work only for 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2DEC("1010B040205")' }],
      [{ cellValue: '=HEX2DEC("7777EE70D2")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(513113223378)
  })
})
