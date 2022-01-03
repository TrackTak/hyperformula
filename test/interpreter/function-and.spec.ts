import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function AND', () => {
  it('usage', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AND(TRUE(), TRUE())' }, { cellValue: '=AND(TRUE(), FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
  })

  it('with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AND(1)' }, { cellValue: '=AND(0)' }, { cellValue: '=AND(1, TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
  })

  it('use coercion #1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AND("TRUE", 1)' }],
      [{ cellValue: '=AND("foo", TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('use coercion #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AND(A4:B4)' }],
      [{ cellValue: '=AND(C4:D4)' }],
      [{ cellValue: '=AND(C4:D4, "foo")' }],
      [{ cellValue: 'TRUE' }, { cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=TRUE()'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('if error in range found, returns first one in row-by-row order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '1' }],
      [{ cellValue: '=AND(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '=AND(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(true)
  })

  it('takes at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AND()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('is computed eagerly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '=4/0' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '=AND(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
