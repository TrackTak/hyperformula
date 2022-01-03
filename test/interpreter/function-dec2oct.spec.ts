import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function DEC2OCT', () => {
  it('should return error when wrong type of argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return error when wrong number of argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT("foo", 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(1)' }],
      [{ cellValue: '=DEC2OCT(10)' }],
      [{ cellValue: '=DEC2OCT(98)' }],
      [{ cellValue: '=DEC2OCT(-12)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('12')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('142')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('7777777764')
  })

  it('should work for numeric strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT("123")' }],
      [{ cellValue: '=DEC2OCT("-15")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('173')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('7777777761')
  })

  it('should work for reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '12' }],
      [{ cellValue: '=DEC2OCT(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('14')
  })

  it('should return string value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(123)' }],
    ])

    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('should work for numbers fitting in 10 bits', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(-536870913)' }],
      [{ cellValue: '=DEC2OCT(-536870912)' }],
      [{ cellValue: '=DEC2OCT(536870911)' }],
      [{ cellValue: '=DEC2OCT(536870912)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('4000000000')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('3777777777')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueBaseLarge))
  })

  it('should respect second argument and fill with zeros for positive arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(2, 8)' }],
      [{ cellValue: '=DEC2OCT(5, "4")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('00000002')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0005')
  })

  it('should ignore second argument for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(-2, 1)' }],
      [{ cellValue: '=DEC2OCT(-2, 10)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('7777777776')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('7777777776')
  })

  it('should allow for numbers from 1 to 10 as second argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DEC2OCT(2, 0)' }],
      [{ cellValue: '=DEC2OCT(-2, 12)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
