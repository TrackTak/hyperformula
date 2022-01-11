import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function OCT2HEX', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-oct arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX("foo")' }],
      [{ cellValue: '=OCT2HEX(418)' }],
      [{ cellValue: '=OCT2HEX(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(1)' }],
      [{ cellValue: '=OCT2HEX(10)' }],
      [{ cellValue: '=OCT2HEX(71)' }],
      [{ cellValue: '=OCT2HEX(12345)' }],
      [{ cellValue: '=OCT2HEX(4242565)' }],
      [{ cellValue: '=OCT2HEX(1234567654)' }],
      [{ cellValue: '=OCT2HEX(7777777000)' }],
      [{ cellValue: '=OCT2HEX(7777777042)' }],
      [{ cellValue: '=OCT2HEX(7777777777)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('8')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('39')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('14E5')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('114575')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('A72EFAC')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('FFFFFFFE00')
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual('FFFFFFFE22')
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual('FFFFFFFFFF')
  })

  it('should work for strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX("456")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('12E')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="123"' }],
      [{ cellValue: '=OCT2HEX(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('53')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(11)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('should work only for 10 digits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(31030220101)' }],
      [{ cellValue: '=OCT2HEX(7777777042)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotOctal))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('FFFFFFFE22')
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(12, 8)' }],
      [{ cellValue: '=OCT2HEX(3, "4")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0000000A')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0003')
  })

  it('should fail if the result is longer than the desired length', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(12123, 2)' }],
      [{ cellValue: '=OCT2HEX(34141, "3")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
  })

  it('second argument should not affect negative results', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(7777777042, 1)' }],
      [{ cellValue: '=OCT2HEX(7777777022, 10)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('FFFFFFFE22')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('FFFFFFFE12')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=OCT2HEX(2, 0)' }],
      [{ cellValue: '=OCT2HEX(2, 12)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
