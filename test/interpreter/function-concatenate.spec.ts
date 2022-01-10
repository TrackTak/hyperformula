import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function CONCATENATE', () => {
  it('validate arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=CONCATENATE()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'John' }, { cellValue: 'Smith' }, { cellValue: '=CONCATENATE(A1, B1)' }]]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('JohnSmith')
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/0' }, { cellValue: '=FOOBAR()' }],
      [{ cellValue: '=CONCATENATE(4/0)' }],
      [{ cellValue: '=CONCATENATE(A1)' }],
      [{ cellValue: '=CONCATENATE(A1,B1)' }],
      [{ cellValue: '=CONCATENATE(A1:B1)' }],
      [{ cellValue: '=CONCATENATE(C1,B1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })

  it('empty value is empty string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 'foo' }, { cellValue: '' }, { cellValue: 'bar' }, { cellValue: '=CONCATENATE(A1, B1, C1)'}],
    ]})

    expect(engine.getCellValue(adr('D1')).cellValue).toEqual('foobar')
  })

  it('supports range values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 'Topleft' }, { cellValue: 'Topright' }],
      [{ cellValue: 'Bottomleft' }, { cellValue: 'Bottomright' }],
      [{ cellValue: '=CONCATENATE(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('TopleftToprightBottomleftBottomright')
  })

  it('coerce to strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRUE()' }, { cellValue: '42' }, { cellValue: '=CONCATENATE(A1:B1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=42%' }, { cellValue: '=CONCATENATE(A2:B2)' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('TRUE42')
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual('TRUE0.42')
  })
})
