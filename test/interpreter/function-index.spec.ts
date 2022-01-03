import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function INDEX', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX()' }],
      [{ cellValue: '=INDEX(B1:D3, 1, 1, 42)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('requires 2nd and 3rd arguments to be integers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:B1, "foo", 1)' }],
      [{ cellValue: '=INDEX(B1:B1, 1, "bar")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('requires 2nd argument to be in bounds of range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:D3, -1, 1)' }],
      [{ cellValue: '=INDEX(B1:D3, 4, 1)' }],
      [{ cellValue: '=INDEX(42, -1, 1)' }],
      [{ cellValue: '=INDEX(42, 2, 1)' }],
      [{ cellValue: '=INDEX(B1, -1, 1)' }],
      [{ cellValue: '=INDEX(B1, 2, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('requires 2nd and 3rd arguments to be in bounds of range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:D3, 1, -1)' }],
      [{ cellValue: '=INDEX(B1:D3, 1, 4)' }],
      [{ cellValue: '=INDEX(42, 1, -1)' }],
      [{ cellValue: '=INDEX(42, 1, 2)' }],
      [{ cellValue: '=INDEX(B1, 1, -1)' }],
      [{ cellValue: '=INDEX(B1, 1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('works for range and nonzero arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:C2, 1, 1)' }, { cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=INDEX(B1:C2, 1, 2)' }, { cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=INDEX(B1:C2, 2, 1)' }],
      [{ cellValue: '=INDEX(B1:C2, 2, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
  })

  it('should propagate errors properly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:C3, 1, 1/0)' }],
      [{ cellValue: '=INDEX(NA(), 1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  it('should return VALUE error when one of the cooridnate is 0 or null', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=INDEX(B1:D5, 0, 2)' }],
      [{ cellValue: '=INDEX(B1:D5, 2, 0)' }],
      [{ cellValue: '=INDEX(B1:D5,,)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
  })

  it('should work for scalars too', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'foo' }],
      [{ cellValue: '=INDEX(A1, 1, 1)' }],
      [{ cellValue: '=INDEX(42, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(42)
  })

  it('should assume first column if no last argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
      [{ cellValue: '=INDEX(A1:B2, 2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
  })
})
