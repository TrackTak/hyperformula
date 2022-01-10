import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ODD', () => {
  it('number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ODD()' }, { cellValue: '=ODD(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works for positive numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ODD(1.3)' }, { cellValue: '=ODD(2.7)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(3)
  })

  it('works for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ODD(-1.3)' }, { cellValue: '=ODD(-2.7)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(-3)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(-3)
  })

  it('use coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ODD("42.3")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(43)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=ODD(A1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
