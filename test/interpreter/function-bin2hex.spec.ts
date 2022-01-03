import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function BIN2HEX', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX("foo", 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-binary arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX("foo")' }],
      [{ cellValue: '=BIN2HEX(1234)' }],
      [{ cellValue: '=BIN2HEX(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(1)' }],
      [{ cellValue: '=BIN2HEX(10)' }],
      [{ cellValue: '=BIN2HEX(010)' }],
      [{ cellValue: '=BIN2HEX(101110)' }],
      [{ cellValue: '=BIN2HEX(1000000000)' }],
      [{ cellValue: '=BIN2HEX(1111111111)' }],
      [{ cellValue: '=BIN2HEX(111111111)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('2')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('2')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('2E')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('FFFFFFFE00')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('FFFFFFFFFF')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('1FF')
  })

  it('should work for binary strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX("1101")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('D')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="1011"' }],
      [{ cellValue: '=BIN2HEX(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('B')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(10111)' }],
    ])

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('should work only for 10 bits', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(10101010101010)' }],
      [{ cellValue: '=BIN2HEX(1010101010)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('FFFFFFFEAA')
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(10, 8)' }],
      [{ cellValue: '=BIN2HEX(101, "4")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00000002')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0005')
  })

  it('second argument should not affect negative results', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(1110110100, 1)' }],
      [{ cellValue: '=BIN2HEX(1110110100, 10)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('FFFFFFFFB4')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('FFFFFFFFB4')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2HEX(2, 0)' }],
      [{ cellValue: '=BIN2HEX(-2, 12)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
