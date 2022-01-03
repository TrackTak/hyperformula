import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function EXACT', () => {
  it('should take two arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT("foo")' }],
      [{ cellValue: '=EXACT("foo", "bar", "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should compare strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT(B1, C1)' }, { cellValue: '' }, { cellValue: '' }],
      [{ cellValue: '=EXACT(B2, C2)' }, { cellValue: 'foo' }, { cellValue: 'foo' }],
      [{ cellValue: '=EXACT(B3, C3)' }, { cellValue: 'foo' }, { cellValue: 'fo' }],
      [{ cellValue: '=EXACT(B4, C4)' }, { cellValue: 'foo' }, { cellValue: 'bar' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(false)
  })

  it('should be case/accent sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT(B1, C1)' }, { cellValue: 'foo' }, { cellValue: 'FOO' }],
      [{ cellValue: '=EXACT(B2, C2)' }, { cellValue: 'foo' }, { cellValue: 'fóó' }],
    ], {caseSensitive: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(false)
  })

  it('should be case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT(B1, C1)' }, { cellValue: 'foo' }, { cellValue: 'Foo' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
  })

  it('should coerce', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT(,)' }],
      [{ cellValue: '=EXACT(B2, "0")' }, { cellValue: 0 }],
      [{ cellValue: '=EXACT(B3, "")' }, { cellValue: null }],
      [{ cellValue: '=EXACT(B4, "TRUE")' }, { cellValue: '=TRUE()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(true)
  })

  it('should return error for range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=EXACT("foo",B1:C1)' }],
      [{ cellValue: '=EXACT(B1:C1,"foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
