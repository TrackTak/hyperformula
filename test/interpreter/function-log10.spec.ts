import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LOG10', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG10(10)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG10("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('for zero', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG10(0)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('for negative arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG10(-42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG10()' }, { cellValue: '=LOG10(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="10"' }, { cellValue: '=LOG10(A1)' }],
      [{ cellValue: '' }, { cellValue: '=LOG10(A2)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOG10(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
