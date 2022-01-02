import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NOT', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NOT()' }, { cellValue: '=NOT(TRUE(), TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NOT(TRUE())' }, { cellValue: '=NOT(FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=NOT("FALSE")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=NOT(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
