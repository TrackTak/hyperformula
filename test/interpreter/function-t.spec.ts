import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function T', () => {
  it('should take one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T()' }],
      [{ cellValue: '=T("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return given text', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T("foo")' }],
      [{ cellValue: '=T(B2)' }, { cellValue: 'bar' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('bar')
  })

  it('should return empty string if given value is not a text', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T(B1)' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=T(B2)' }, { cellValue: 42 }],
      [{ cellValue: '=T(B3)' }, { cellValue: null }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('')
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T(B1)' }, { cellValue: '=1/0' }],
      [{ cellValue: '=T(B2)' }, { cellValue: '=FOO()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOO')))
  })
})
