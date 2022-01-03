import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LN', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LN(2.718281828459045)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LN("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('for zero', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LN(0)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('for negative arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LN(-42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LN()' }, { cellValue: '=LN(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="2.718281828459045"' }, { cellValue: '=LN(A1)' }],
      [{ cellValue: '' }, { cellValue: '=LN(A2)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LN(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
