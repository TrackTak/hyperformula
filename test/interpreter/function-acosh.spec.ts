import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ACOSH', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ACOSH(1)' }, { cellValue: '=ACOSH(2)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(1.31695789692482)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ACOSH("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('too small', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ACOSH(0.9)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ACOSH()' }, { cellValue: '=ACOSH(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="1"' }, { cellValue: '=ACOSH(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=ACOSH(A2)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(0)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ACOSH(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
