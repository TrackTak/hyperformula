import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Operator POWER', () => {
  it('works for obvious case', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=8^3' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(512)
  })

  it('use number coerce', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="8"^"3"' }],
      [{ cellValue: '="foobar"^1' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(512)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('pass error from left operand', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2^3' }],
      [{ cellValue: '=4/0' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('pass error from right operand', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=3^A2' }],
      [{ cellValue: '=4/0' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('pass error from left operand if both operands have error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2^B2' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '=4/0' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '8' }],
      [{ cellValue: '3' }],
      [{ cellValue: '=10 ^ A1:A3' }],
      [{ cellValue: '=A1:A3 ^ 10' }],
    ], {useArrayArithmetic: false})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('Power propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)^2' }, { cellValue: '=2^(1/0)'}, {cellValue: '=(A1:B1)^(1/0)' }, { cellValue: '=(1/0)^(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('NaN as a result', () => {

    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '01/02/1999' }, { cellValue: '02/02/1999' }, { cellValue: '=A1^B1' }],
      [{ cellValue: '3.1415' }, { cellValue: '36193.2' }, { cellValue: '=A2^B2' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })
})
