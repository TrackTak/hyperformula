import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DEGREES', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEGREES(0)' }, { cellValue: '=DEGREES(3.14)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(179.9087477)
  })

  it('given wrong argument type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEGREES("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="3.14"' }, { cellValue: '=DEGREES(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=DEGREES(A2)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(179.9087477)
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(57.29577951)
  })

  it('given wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEGREES()' }],
      [{ cellValue: '=DEGREES(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DEGREES(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
