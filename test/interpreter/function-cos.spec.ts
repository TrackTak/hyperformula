import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COS', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COS(0)' }, { cellValue: '=COS(7)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.753902254343305)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COS("foo")' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COS()' }, { cellValue: '=COS(1,-1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="-1"' }, { cellValue: '=COS(A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.54030230586814)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COS(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
