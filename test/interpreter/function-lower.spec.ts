import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LOWER', () => {
  it('should take one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOWER()' }],
      [{ cellValue: '=LOWER("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should convert text to lowercase', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOWER("")' }],
      [{ cellValue: '=LOWER(B1)' }],
      [{ cellValue: '=LOWER("foo")' }],
      [{ cellValue: '=LOWER("FOO")' }],
      [{ cellValue: '=LOWER("BaR")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('bar')
  })

  it('should coerce', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=LOWER(TRUE())' }],
      [{ cellValue: '=LOWER(0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('true')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0')
  })
})
