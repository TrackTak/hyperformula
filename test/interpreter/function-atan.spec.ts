import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ATAN', () => {
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ATAN(1)' }]] }, {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0.7853981633974483)
  })

  it('when value not numeric', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ATAN("foo")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ATAN()' }, { cellValue: '=ATAN(1,-1)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('use number coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="-1"' }, { cellValue: '=ATAN(A1)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(-0.785398163397448)
  })

  it('errors propagation', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ATAN(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
