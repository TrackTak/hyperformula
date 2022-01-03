import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Percent operator', () => {
  it('works for obvious case', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3%' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0.03)
  })

  it('use number coerce', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="3"%' }],
      [{ cellValue: '="foobar"%' }],
      [{ cellValue: '=TRUE()%' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0.03)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0.01)
  })

  it('pass reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2%' }],
      [{ cellValue: '=42' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.42)
  })

  it('pass error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2%' }],
      [{ cellValue: '=FOOBAR()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })

  it('works with other operator and coercion', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=TRUE()%*1' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.01)
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '9' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=A1:A3%' }],
    ], {useArrayArithmetic: false})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })
})
