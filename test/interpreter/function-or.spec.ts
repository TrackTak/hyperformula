import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function OR', () => {
  it('usage', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OR(TRUE())' }, { cellValue: '=OR(FALSE())' }, { cellValue: '=OR(FALSE(), TRUE(), FALSE())' }, { cellValue: '=OR("asdf")'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('use coercion #1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OR("TRUE", 0)' }],
      [{ cellValue: '=OR("foo", 0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('use coercion #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OR(A4:B4)' }],
      [{ cellValue: '=OR(C4:D4)' }],
      [{ cellValue: '=OR(C4:D4, "foo")' }],
      [{ cellValue: 'TRUE' }, { cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=TRUE()'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('function OR with numerical arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OR(1)' }, { cellValue: '=OR(0)' }, { cellValue: '=OR(FALSE(), 42)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
  })

  it('function OR takes at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OR()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('if error in range found, returns first one in row-by-row order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '1' }],
      [{ cellValue: '=OR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '0' }],
      [{ cellValue: '0' }, { cellValue: '1' }],
      [{ cellValue: '=OR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(true)
  })

  it('is computed eagerly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '0' }, { cellValue: '1' }],
      [{ cellValue: '=OR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
