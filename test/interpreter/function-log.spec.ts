import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LOG', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(4, 2)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(2)
  })

  it('logarithmic base has default', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(10)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOG("foo", 42)' }],
      [{ cellValue: '=LOG(42, "foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('for zero', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(0, 42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('for negative value', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(-42, 42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('for zero base', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(42, 0)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('for 1 base', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(42, 1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('for negative base', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG(42, -42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=LOG()' }, { cellValue: '=LOG(42, 42, 42)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="10"' }, { cellValue: '=LOG(A1, 10)' }, { cellValue: '=LOG(10, A1)' }],
      [{ cellValue: '' }, { cellValue: '=LOG(A2, 42)' }, { cellValue: '=LOG(42, 0)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOG(4/0, 42)' }],
      [{ cellValue: '=LOG(42, 4/0)' }],
      [{ cellValue: '=LOG(4/0, FOOBAR())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
