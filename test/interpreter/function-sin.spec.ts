import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SIN', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SIN(0)' }, { cellValue: '=SIN(0.5)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.479425538604203)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SIN("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SIN()' }, { cellValue: '=SIN(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="-1"' }, { cellValue: '=SIN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-0.841470984807897)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SIN(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
