import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ACOT', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOT(0)' }, { cellValue: '=ACOT(1)' }]])

    expect(engine.getCellValue(adr('A1'))).toBeCloseTo(1.5707963267949)
    expect(engine.getCellValue(adr('B1'))).toBeCloseTo(0.785398163397448)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOT("foo")' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ACOT()' }, { cellValue: '=ACOT(1,-1)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="-1"' }, { cellValue: '=ACOT(A1)' }],
      [{ cellValue: '' }, { cellValue: '=ACOT(A2)' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toBeCloseTo(-0.785398163397448)
    expect(engine.getCellValue(adr('B2'))).toEqual(1.5707963267949)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ACOT(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
