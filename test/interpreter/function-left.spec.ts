import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LEFT', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT()' }],
      [{ cellValue: '=LEFT("foo", 1, 2)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return VALUE when wrong type of second parameter', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work with empty argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT(, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
  })

  it('should return one character by default', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT("bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('b')
  })

  it('should return VALUE when second parameter is less than 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT("foo", -1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NegativeLength))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT("", 4)' }],
      [{ cellValue: '=LEFT("bar", 0)' }],
      [{ cellValue: '=LEFT("bar", 1)' }],
      [{ cellValue: '=LEFT("bar", 3)' }],
      [{ cellValue: '=LEFT("bar", 4)' }],
      [{ cellValue: '=LEFT(123, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('b')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('bar')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('bar')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('12')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LEFT(1, 1)' }],
      [{ cellValue: '=LEFT(5+5, 1)' }],
      [{ cellValue: '=LEFT(TRUE(), 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('T')
  })
})
