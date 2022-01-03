import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COTH', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COTH(1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.31303528549933)
  })

  it('DIV/0 for zero', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COTH(0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COTH("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COTH()' }, { cellValue: '=COTH(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="-1"' }, { cellValue: '=COTH(A1)' }],
      [{ cellValue: '' }, { cellValue: '=COTH(A2)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-1.31303528549933)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COTH(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
