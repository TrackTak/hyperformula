import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function REPT', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPT()' }],
      [{ cellValue: '=REPT("foo")' }],
      [{ cellValue: '=REPT("foo", 1, 2)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return VALUE when wrong type of second parameter', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPT("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return VALUE when second parameter is less than 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPT("foo", -1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NegativeCount))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPT("foo", 0)' }],
      [{ cellValue: '=REPT("foo", 3)' }],
      [{ cellValue: '=REPT(1, 5)' }],
      [{ cellValue: '=REPT(, 5)' }],
      [{ cellValue: '=REPT("Na", 7)&" Batman!"' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foofoofoo')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('11111')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('NaNaNaNaNaNaNa Batman!')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPT(1, 1)' }],
      [{ cellValue: '=REPT(5+5, 1)' }],
      [{ cellValue: '=REPT(TRUE(), 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('10')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('TRUE')
  })
})
