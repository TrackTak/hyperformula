import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function UPPER', () => {
  it('should take one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UPPER()' }],
      [{ cellValue: '=UPPER("foo", "bar")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should convert text to uppercase', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UPPER("")' }],
      [{ cellValue: '=UPPER(B1)' }],
      [{ cellValue: '=UPPER("FOO")' }],
      [{ cellValue: '=UPPER("foo")' }],
      [{ cellValue: '=UPPER("bAr")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('FOO')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('FOO')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('BAR')
  })

  it('should coerce', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UPPER(TRUE())' }],
      [{ cellValue: '=UPPER(0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('TRUE')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('0')
  })
})
