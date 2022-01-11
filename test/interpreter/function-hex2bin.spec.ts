import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function HEX2BIN', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-hex arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("foo")' }],
      [{ cellValue: '=HEX2BIN("G418")' }],
      [{ cellValue: '=HEX2BIN(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("1")' }],
      [{ cellValue: '=HEX2BIN("F")' }],
      [{ cellValue: '=HEX2BIN("2A")' }],
      [{ cellValue: '=HEX2BIN("1FF")' }],
      [{ cellValue: '=HEX2BIN("FFFFFFFFF6")' }],
      [{ cellValue: '=HEX2BIN("FFFFFFFF9C")' }],
      [{ cellValue: '=HEX2BIN("FFFFFFFE00")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1111')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('101010')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('111111111')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('1111110110')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('1110011100')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('1000000000')
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN(156)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('101010110')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="12A"' }],
      [{ cellValue: '=HEX2BIN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('100101010')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN(11)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('result cannot be longer than 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("200")' }],
      [{ cellValue: '=HEX2BIN("FFFFFFFDFF")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLarge))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseSmall))
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN(12, 8)' }],
      [{ cellValue: '=HEX2BIN(3, "4")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00010010')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0011')
  })

  it('second argument should not affect negative results', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("FFFFFFFF9C", 1)' }],
      [{ cellValue: '=HEX2BIN("FFFFFFFFF6", 10)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1110011100')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1111110110')
  })

  it('should fail if the result is longer than the desired length', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN("100", 2)' }],
      [{ cellValue: '=HEX2BIN("FF", "3")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=HEX2BIN(2, 0)' }],
      [{ cellValue: '=HEX2BIN(2, 12)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
