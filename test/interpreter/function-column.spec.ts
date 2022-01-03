import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COLUMN', () => {
  it('should take one or zero arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(B1, B2)' }],
      [{ cellValue: '=COLUMN(B1, B2, B3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should take only reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(42)' }],
      [{ cellValue: '=COLUMN("foo")' }],
      [{ cellValue: '=COLUMN(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(1/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return row of a reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(A2)' }],
      [{ cellValue: '=COLUMN(G7)' }],
      [{ cellValue: '=COLUMN($E5)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(7)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(5)
  })

  it('should work for itself', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(A1)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('should return row of a cell in which formula is', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=COLUMN()' }],
      [{ cellValue: '=COLUMN()' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('should return row of range start', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(C1:D1)' }],
      [{ cellValue: '=COLUMN(A1:B1)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('should be dependent on sheet structure changes', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '=COLUMN(A1)' }]
    ])
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)

    engine.addColumns(0, [0, 1])

    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(2)
  })

  it('should collect dependencies of inner function and return argument type error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SIN(1)' }],
      [{ cellValue: '=COLUMN(SUM(A1,A3))' }],
      [{ cellValue: '=SIN(1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should propagate error of inner function', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1/0' }],
      [{ cellValue: '=COLUMN(SUM(A1, A3))' }],
      [{ cellValue: '=1/0' }]
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return #CYCLE! when cyclic reference occurs not directly in COLUMN', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COLUMN(SUM(A1))' }],
      [{ cellValue: '=COLUMN(A1+A2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
  })
})
