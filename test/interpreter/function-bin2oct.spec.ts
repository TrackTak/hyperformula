import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function BIN2OCT', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for non-binary arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT("foo")' }],
      [{ cellValue: '=BIN2OCT(1234)' }],
      [{ cellValue: '=BIN2OCT(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(1)' }],
      [{ cellValue: '=BIN2OCT(10)' }],
      [{ cellValue: '=BIN2OCT(010)' }],
      [{ cellValue: '=BIN2OCT(101110)' }],
      [{ cellValue: '=BIN2OCT(1000000000)' }],
      [{ cellValue: '=BIN2OCT(1111111111)' }],
      [{ cellValue: '=BIN2OCT(111111111)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('2')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('2')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('56')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('7777777000')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('7777777777')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('777')
  })

  it('should work for binary strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT("1101")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('15')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="1011"' }],
      [{ cellValue: '=BIN2OCT(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('13')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(10111)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('should work only for 10 bits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(10101010101010)' }],
      [{ cellValue: '=BIN2OCT(1010101010)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('7777777252')
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(10, 8)' }],
      [{ cellValue: '=BIN2OCT(101, "4")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00000002')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0005')
  })

  it('second argument should not affect negative results', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(1110110100, 1)' }],
      [{ cellValue: '=BIN2OCT(1110110100, 10)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('7777777664')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('7777777664')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BIN2OCT(2, 0)' }],
      [{ cellValue: '=BIN2OCT(-2, 12)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
