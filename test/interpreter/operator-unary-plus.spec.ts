import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Unary operator PLUS', () => {
  it('works for obvious case', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=+3' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3)
  })

  it('use number coerce', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=+"3"' }],
      [{ cellValue: '=+"foobar"' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('3')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foobar')
  })

  it('pass error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=+B1' }, { cellValue: '=FOOBAR()' }],
      [{ cellValue: '=+B2' }, { cellValue: '=1/0' }],

    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '9' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=+A1:A3' }],
    ], {useArrayArithmetic: false})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('string given by reference should return string with UNARY+', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'Liz' }],
      [{ cellValue: '=+A1' }]
    ])
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('Liz') // UNARY PLUS value
  })

  it('double unary plus', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=++2' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })
})
