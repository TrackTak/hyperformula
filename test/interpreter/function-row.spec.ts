import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function ROW', () => {
  it('should take one or zero arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(B1, B2)' }],
      [{ cellValue: '=ROW(B1, B2, B3)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should take only reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(42)' }],
      [{ cellValue: '=ROW("foo")' }],
      [{ cellValue: '=ROW(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.CellRefExpected))
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(1/0)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return row of a reference', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(B1)' }],
      [{ cellValue: '=ROW(B7)' }],
      [{ cellValue: '=ROW(F$5)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(1)
    expect(engine.getCellValue(adr('A2'))).toEqual(7)
    expect(engine.getCellValue(adr('A3'))).toEqual(5)
  })

  it('should work for itself', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(A1)' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(1)
  })

  it('should return row of a cell in which formula is', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=ROW()' }],
      [{ cellValue: '=ROW()' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqual(1)
    expect(engine.getCellValue(adr('A2'))).toEqual(2)
  })

  it('should return row of range start', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ROW(A3:A4)' }],
      [{ cellValue: '=ROW(B1:B2)' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(3)
    expect(engine.getCellValue(adr('A2'))).toEqual(1)
  })

  it('should be dependent on sheet structure changes', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '=ROW(A1)' }]
    ])
    expect(engine.getCellValue(adr('A2'))).toEqual(1)

    engine.addRows(0, [{ cellValue: 0 }, { cellValue: 1 }])

    expect(engine.getCellValue(adr('A3'))).toEqual(2)
  })
})
