import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NOT', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NOT()' }, { cellValue: '=NOT(TRUE(), TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NOT(TRUE())' }, { cellValue: '=NOT(FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(true)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NOT("FALSE")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=NOT(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
