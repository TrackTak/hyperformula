import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function RIGHT', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT()' }],
      [{ cellValue: '=RIGHT("foo", 1, 2)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return VALUE when wrong type of second parameter', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT("foo", "bar")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work with empty argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT(, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
  })

  it('should return one character by default', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT("bar")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('r')
  })

  it('should return VALUE when second parameter is less than 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT("foo", -1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NegativeLength))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT("", 4)' }],
      [{ cellValue: '=RIGHT("bar", 0)' }],
      [{ cellValue: '=RIGHT("bar", 1)' }],
      [{ cellValue: '=RIGHT("bar", 3)' }],
      [{ cellValue: '=RIGHT("bar", 4)' }],
      [{ cellValue: '=RIGHT(123, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('r')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('bar')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('bar')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('23')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=RIGHT(1, 1)' }],
      [{ cellValue: '=RIGHT(5+5, 1)' }],
      [{ cellValue: '=RIGHT(TRUE(), 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('E')
  })
})
