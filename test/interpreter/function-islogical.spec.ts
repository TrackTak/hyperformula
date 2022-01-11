import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISLOGICAL', () => {
  it('should return true for boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISLOGICAL(1<1)' }, { cellValue: '=ISLOGICAL(ISLOGICAL(A1))' }, { cellValue: '=ISLOGICAL(A2)' }],
      [{ cellValue: false }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
  })

  it('should return false for non-boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISLOGICAL(-0)' }, { cellValue: '=ISLOGICAL(A2)' }, { cellValue: '=ISLOGICAL("foo")' }],
      [{ cellValue: null }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISLOGICAL(1, 2)' }, { cellValue: '=ISLOGICAL()' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=4/1' }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=4/2' }],
      [{ cellValue: '=ISLOGICAL(A1:A3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
