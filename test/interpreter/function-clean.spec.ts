import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CLEAN', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CLEAN()' }],
      [{ cellValue: '=CLEAN("foo", "bar")' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CLEAN("foo\u0000")' }],
      [{ cellValue: '=CLEAN("foo\u0020")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foo\u0020')
  })

  it('should clean all non-printable ASCII characters', () => {
    const str = Array.from(Array(32).keys()).map(code => String.fromCharCode(code)).join('')

    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: str }, { cellValue: '=LEN(A1)' }, { cellValue: '=CLEAN(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(32)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CLEAN(1)' }],
      [{ cellValue: '=CLEAN(5+5)' }],
      [{ cellValue: '=CLEAN(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('10')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('TRUE')
  })
})
