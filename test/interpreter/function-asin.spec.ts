import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ASIN', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN(0)' }, { cellValue: '=ASIN(0.5)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.523598775598299)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('for 1 (edge)', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN(1)' }]] }, {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(Math.PI / 2)
  })

  it('for -1 (edge)', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN(-1)' }]] }, {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-Math.PI / 2)
  })

  it('when value too large', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN(1.1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('when value too small', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN(-1.1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NaN))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASIN()' }, { cellValue: '=ASIN(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="-1"' }, { cellValue: '=ASIN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-Math.PI / 2)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASIN(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
