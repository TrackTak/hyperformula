import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ATANH', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ATANH(0)' }, { cellValue: '=ATANH(0.5)' }]], {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.5493061443340548)
  })

  it('error for 1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ATANH(1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('error for -1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ATANH(-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ATANH("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ATANH()' }, { cellValue: '=ATANH(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="0"' }, { cellValue: '=ATANH(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ATANH(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
