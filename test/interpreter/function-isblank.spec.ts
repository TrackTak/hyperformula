import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISBLANK', () => {
  it('should return true for references to empty cells', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=ISBLANK(A1)' }, { cellValue: '=ISBLANK(A2)' }],
      [{ cellValue: '=A1' }],
    ])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
  })

  it('should return false for empty string', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '' }, { cellValue: '=ISBLANK(A1)' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
  })

  it('should return false if it is not reference to empty cell', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=ISBLANK("")' }, { cellValue: '=ISBLANK(4)' }, { cellValue: '=ISBLANK(CONCATENATE(A1,A1))'}],
    ])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(false)
  })

  it('takes exactly one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISBLANK(A3, A2)' }, { cellValue: '=ISBLANK()' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('no error propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISBLANK(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
  })

  it('range value results in VALUE error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }],
      [{ cellValue: null }],
      [{ cellValue: null }],
      [{ cellValue: '=ISBLANK(A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
