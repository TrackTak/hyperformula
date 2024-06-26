import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ABS', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ABS(-1)' }, { cellValue: '=ABS(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
  })

  it('given wrong argument type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ABS("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="2"' }, { cellValue: '=ABS(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=ABS(A2)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(1)
  })

  it('given wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ABS()' }],
      [{ cellValue: '=ABS(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ABS(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
