import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function DEC2BIN', () => {
  it('should return error when wrong type of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN("foo", 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(1)' }],
      [{ cellValue: '=DEC2BIN(2)' }],
      [{ cellValue: '=DEC2BIN(98)' }],
      [{ cellValue: '=DEC2BIN(-12)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('10')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('1100010')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('1111110100')
  })

  it('should work for numeric strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN("123")' }],
      [{ cellValue: '=DEC2BIN("-15")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1111011')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1111110001')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '12' }],
      [{ cellValue: '=DEC2BIN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1100')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(123)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('should work for numbers between -512 and 511', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(-513)' }],
      [{ cellValue: '=DEC2BIN(-512)' }],
      [{ cellValue: '=DEC2BIN(511)' }],
      [{ cellValue: '=DEC2BIN(512)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1000000000')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('111111111')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLarge))
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(2, 8)' }],
      [{ cellValue: '=DEC2BIN(5, "4")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00000010')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0101')
  })

  it('should fail if the result is longer than the desired number of digits', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(50, 1)' }],
      [{ cellValue: '=DEC2BIN(777, "4")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLong))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLarge))
  })

  it('should ignore second argument for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(-2, 1)' }],
      [{ cellValue: '=DEC2BIN(-2, 10)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1111111110')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1111111110')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEC2BIN(2, 0)' }],
      [{ cellValue: '=DEC2BIN(-2, 12)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
