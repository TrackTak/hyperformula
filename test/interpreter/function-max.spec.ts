import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('MAX', () => {
  it('MAX with empty args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MAX()' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('MAX with args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MAX(1, B1)' }, { cellValue: '3.14' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(3.14)
  })

  it('MAX with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=MAX(A1:A3)' }]]})
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('MAX with mixed arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=MAX(4,A1:A3)' }]]})
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
  })

  it('doesnt do coercions', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: '=TRUE()' }],
      [{ cellValue: '=CONCATENATE("1","0")' }],
      [{ cellValue: '=MAX(A1:A5)' }],
    ]})

    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(2)
  })

  it('MAX of strings and -1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }], [{ cellValue: 'bar' }], [{ cellValue: '-1' }], [{ cellValue: '=MAX(A1:A3)' }]]})
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-1)
  })

  it('MAX of empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '' }, { cellValue: '=MAX(A1)' }]]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('MAX of empty value and some negative number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '' }, { cellValue: '-1' }, { cellValue: '=MAX(A1,B1)' }]]})
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(-1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MAX(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(22)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=MAX(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
