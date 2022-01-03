import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('MIN', () => {
  it('MIN with empty args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=MIN()' }]])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('MIN with args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=MIN(1, B1)' }, { cellValue: '3.14' }]])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('MIN with range', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=MIN(A1:A3)' }]])
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('MIN with mixed arguments', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=MIN(4,A1:A3)' }]])
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('MIN of strings and number', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 'foo' }], [{ cellValue: 'bar' }], [{ cellValue: '5' }], [{ cellValue: '=MIN(A1:A3)' }]])
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5)
  })

  it('doesnt do coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: '=TRUE()' }],
      [{ cellValue: '=CONCATENATE("1","0")' }],
      [{ cellValue: '=MIN(A1:A5)' }],
    ])

    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(1)
  })

  it('MIN of empty value', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '' }, { cellValue: '=MIN(A1)' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('MIN of empty value and some negative number', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '' }, { cellValue: '1' }, { cellValue: '=MIN(A1,B1)' }]])
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MIN(MMULT(A1:B2, A1:B2))' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(7)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=MIN(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
