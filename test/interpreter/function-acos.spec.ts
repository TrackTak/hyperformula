import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ACOS', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS(0.5)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.0471975511966)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('for 1 (edge)', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS(1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
  })

  it('for -1 (edge)', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS(-1)' }]],
      {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(Math.PI)
  })

  it('when value too large', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS(1.1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('when value too small', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS(-1.1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOS()' }, { cellValue: '=ACOS(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="-1"' }, { cellValue: '=ACOS(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=ACOS(A2)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(3.141592654)
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(0)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ACOS(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
