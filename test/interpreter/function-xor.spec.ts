import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function XOR', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR(TRUE(), TRUE())' }],
      [{ cellValue: '=XOR(TRUE(), FALSE())' }],
      [{ cellValue: '=XOR(FALSE(), TRUE())' }],
      [{ cellValue: '=XOR(FALSE(), FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(false)
  })

  it('at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('for one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR(TRUE())' }],
      [{ cellValue: '=XOR(FALSE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(false)
  })

  it('use coercion #1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR("TRUE")' }],
      [{ cellValue: '=XOR(1)' }],
      [{ cellValue: '=XOR(1, "foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('use coercion #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR(A4:B4)' }],
      [{ cellValue: '=XOR(C4:D4)' }],
      [{ cellValue: '=XOR(C4:D4, "foo")' }],
      [{ cellValue: 'TRUE' }, { cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=TRUE()'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('when no coercible to number arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('returns TRUE iff odd number of TRUEs present', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XOR(TRUE(), TRUE(), TRUE())' }],
      [{ cellValue: '=XOR(TRUE(), TRUE(), TRUE(), TRUE())' }],
      [{ cellValue: '=XOR(TRUE(), TRUE(), TRUE(), TRUE(), TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(true)
  })

  it('if error in range found, returns first one in row-by-row order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '1' }],
      [{ cellValue: '=XOR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works with ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '0' }],
      [{ cellValue: '0' }, { cellValue: '1' }],
      [{ cellValue: '=XOR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(true)
  })

  it('is computed eagerly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '0' }, { cellValue: '1' }],
      [{ cellValue: '=XOR(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
