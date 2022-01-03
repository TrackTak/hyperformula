import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function HEX2OCT', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("foo", 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-hex arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("foo")' }],
      [{ cellValue: '=HEX2OCT("G418")' }],
      [{ cellValue: '=HEX2OCT(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("1")' }],
      [{ cellValue: '=HEX2OCT("F")' }],
      [{ cellValue: '=HEX2OCT("2A")' }],
      [{ cellValue: '=HEX2OCT("26235")' }],
      [{ cellValue: '=HEX2OCT("1BB95B19")' }],
      [{ cellValue: '=HEX2OCT("CE6D570")' }],
      [{ cellValue: '=HEX2OCT("FFFB4B62A9")' }],
      [{ cellValue: '=HEX2OCT("FFFF439EB2")' }],
      [{ cellValue: '=HEX2OCT("FFFFFFFFFF")' }],
      [{ cellValue: '=HEX2OCT("1FFFFFFF")' }],
      [{ cellValue: '=HEX2OCT("FFE0000000")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('17')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('52')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('461065')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('3356255431')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('1471552560')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('7322661251')
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual('7720717262')
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual('7777777777')
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual('3777777777')
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual('4000000000')
  })

  it('should work for numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT(456)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('2126')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="123"' }],
      [{ cellValue: '=HEX2OCT(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('443')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT(11)' }],
    ])

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('result cannot be longer than 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("FFDFFFFFFF")' }],
      [{ cellValue: '=HEX2OCT("3FFFFFFF")' }], ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLarge))
  })

  it('input cannot have more than 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("10000000000")' }],

    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT(12, 8)' }],
      [{ cellValue: '=HEX2OCT(3, "4")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00000022')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0003')
  })

  it('should fail if the result is longer than the desired length', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT(32123, 2)' }],
      [{ cellValue: '=HEX2OCT(433141, "3")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
  })

  it('second argument should not affect negative results', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT("FFFB4B62A9", 1)' }],
      [{ cellValue: '=HEX2OCT("FFFF439EB2", 10)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('7322661251')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('7720717262')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HEX2OCT(2, 0)' }],
      [{ cellValue: '=HEX2OCT(2, 12)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
