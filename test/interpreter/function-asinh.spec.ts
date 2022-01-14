import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ASINH', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASINH(0)' }, { cellValue: '=ASINH(0.5)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.481211825059604)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASINH("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASINH()' }, { cellValue: '=ASINH(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="-1"' }, { cellValue: '=ASINH(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-0.881373587019543)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASINH(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
