import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function RADIANS', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RADIANS(0)' }, { cellValue: '=RADIANS(180.0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(3.1415)
  })

  it('given wrong argument type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RADIANS("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="180"' }, { cellValue: '=RADIANS(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=RADIANS(A2)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(3.1415)
    expect(engine.getCellValue(adr('B2')).cellValue).toBeCloseTo(0.017453292519943295)
  })

  it('given wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RADIANS()' }],
      [{ cellValue: '=RADIANS(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=RADIANS(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
