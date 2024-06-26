import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SECH', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECH(0)' }, { cellValue: '=SECH(0.5)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.886818883970074)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECH("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SECH()' }, { cellValue: '=SECH(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="-1"' }, { cellValue: '=SECH(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(0.648054273663886)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SECH(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
