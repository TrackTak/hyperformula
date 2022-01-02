import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function CONCATENATE', () => {
  it('validate arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=CONCATENATE()' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 'John' }, { cellValue: 'Smith' }, { cellValue: '=CONCATENATE(A1, B1)' }]])

    expect(engine.getCellValue(adr('C1'))).toEqual('JohnSmith')
  })

  it('propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }, { cellValue: '=FOOBAR()' }],
      [{ cellValue: '=CONCATENATE(4/0)' }],
      [{ cellValue: '=CONCATENATE(A1)' }],
      [{ cellValue: '=CONCATENATE(A1,B1)' }],
      [{ cellValue: '=CONCATENATE(A1:B1)' }],
      [{ cellValue: '=CONCATENATE(C1,B1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A6'))).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })

  it('empty value is empty string', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'foo' }, { cellValue: '' }, { cellValue: 'bar' }, { cellValue: '=CONCATENATE(A1, B1, C1)'}],
    ])

    expect(engine.getCellValue(adr('D1'))).toEqual('foobar')
  })

  it('supports range values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'Topleft' }, { cellValue: 'Topright' }],
      [{ cellValue: 'Bottomleft' }, { cellValue: 'Bottomright' }],
      [{ cellValue: '=CONCATENATE(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3'))).toEqual('TopleftToprightBottomleftBottomright')
  })

  it('coerce to strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE()' }, { cellValue: '42' }, { cellValue: '=CONCATENATE(A1:B1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=42%' }, { cellValue: '=CONCATENATE(A2:B2)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqual('TRUE42')
    expect(engine.getCellValue(adr('C2'))).toEqual('TRUE0.42')
  })
})
