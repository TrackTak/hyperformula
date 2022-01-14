import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('COUNT', () => {
  it('COUNT with empty args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=COUNT()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('COUNT with args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=COUNT(1, B1)' }, { cellValue: '3.14' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('COUNT with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }], [{ cellValue: '3' }], [{ cellValue: '2' }], [{ cellValue: '=COUNT(A1:A3)' }]]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('COUNT ignores all nonnumeric arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }], [{ cellValue: null }], [{ cellValue: '=TRUE()' }], [{ cellValue: '=COUNT(A1:A3)' }]]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=COUNT(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
  })

  it('error in ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '' }, { cellValue: '' }],
      [{ cellValue: '=COUNT(MMULT(A1:B3, A1:B3))' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
  })

  it('doesnt propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=COUNT(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })

  it('should work with explicit error in arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COUNT(NA())' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('should work for empty arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COUNT(1,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })
})
