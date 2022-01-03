import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISNUMBER', () => {
  it('should return true for numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNUMBER(1)' }, { cellValue: '=ISNUMBER(-0)' }, { cellValue: '=ISNUMBER(1+1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
  })

  it('should return false for nonnumbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNUMBER(1<1)' }, { cellValue: '=ISNUMBER(A2)' }, { cellValue: '=ISNUMBER("foo")' }],
      [{ cellValue: null }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISNUMBER(1, 2)' }, { cellValue: '=ISNUMBER()' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
})
