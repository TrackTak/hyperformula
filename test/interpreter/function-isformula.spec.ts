import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ISFORMULA', () => {
  it('should return true for cell with formula', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A1' }, { cellValue: '=ISFORMULA(A1)' }]
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
  })

  it('should return false for cell without formula', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'foo' }, { cellValue: '=ISFORMULA(A1)' }, { cellValue: '=ISFORMULA(A2)' }]
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false)
  })

  it('should work with start of a range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A1' }, { cellValue: 2 }, { cellValue: '=ISFORMULA(A1:A2)' }, { cellValue: '=ISFORMULA(B1:B2)'}]
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(false)
  })

  it('should propagate error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISFORMULA(1/0)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return NA otherwise', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISFORMULA()' }, { cellValue: '=ISFORMULA(A1, A2)' }, { cellValue: '=ISFORMULA("foo")' }, { cellValue: '=ISFORMULA(42)'}]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should work for itself', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISFORMULA(A1)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(true)
  })

  it('should collect dependencies of inner function and return argument type error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SIN(1)' }],
      [{ cellValue: '=ISFORMULA(SUM(A1,A3))' }],
      [{ cellValue: '=SIN(1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should propagate error of inner function', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1/0' }],
      [{ cellValue: '=ISFORMULA(SUM(A1, A3))' }],
      [{ cellValue: '=1/0' }]
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return #CYCLE! when cyclic reference occurs not directly in COLUMN', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ISFORMULA(SUM(A1))' }],
      [{ cellValue: '=ISFORMULA(A1+A2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
  })
})
