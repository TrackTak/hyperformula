import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DECIMAL', () => {
  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DECIMAL(123)' }],
      [{ cellValue: '=DECIMAL("foo", 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error when value does not correspond to base', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DECIMAL(12, 2)' }],
      [{ cellValue: '=DECIMAL("123XYZ", 33)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DECIMAL(10, 2)' }],
      [{ cellValue: '=DECIMAL("11111111111111111111111111111111110", 2)' }],
      [{ cellValue: '=DECIMAL(123, 4)' }],
      [{ cellValue: '=DECIMAL("C0FFEE", 16)' }],
      [{ cellValue: '=DECIMAL("C0FFEE", 25)' }],
      [{ cellValue: '=DECIMAL("89WPQ", 33)' }],
      [{ cellValue: '=DECIMAL("123XYZ", 36)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(34359738366)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(27)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(12648430)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(117431614)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(9846500)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(64009403)
  })

  it('should work for of max length 255', () => {
    const longNumber = '1'.repeat(255)
    const tooLongNumber = '1'.repeat(256)
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: `=DECIMAL(\"${longNumber}\", 2)` }],
      [{ cellValue: `=DECIMAL(\"${tooLongNumber}\", 2)` }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5.78960446186581e+76)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotHex))
  })

  it('should work only for bases from 2 to 36', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DECIMAL("0", 0)' }],
      [{ cellValue: '=DECIMAL("10", 2)' }],
      [{ cellValue: '=DECIMAL("XYZ", 36)' }],
      [{ cellValue: '=DECIMAL("XYZ", 37)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(44027)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('should return number', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DECIMAL("123", 4)' }],
    ])

    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
  })
})
