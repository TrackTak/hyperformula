import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function XNPV', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1,1)' }, { cellValue: '=XNPV(1, 1, 1, 1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  /**
   * Product #2 implements only Rate>0 (even though states in the documentation that Rate>-1).
   */
  it('should accept Rate values that are greater than -1.', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(-1, A2:D2, A3:D3)' }, { cellValue: '=XNPV(2, A2:D2, A3:D3)' }, { cellValue: '=XNPV(-0.9, A2:D2, A3:D3)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toBeCloseTo(9.94002794561453, 6)
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(10.1271695921145, 6)
  })

  it('should calculate the correct value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(2%, 1, 1)' }],
      [{ cellValue: '=XNPV(1, B2:C2, D2:E2)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(2.99620553730319, 6)
  })

  it('should round dates', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:C1, D1:E1)'}, { cellValue: 1}, { cellValue: 2}, { cellValue: 3.1}, { cellValue: 4}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(2.99620553730319, 6)
  })

  it('only first date needs to be earliest', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:E1, F1:I1)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 1 }, { cellValue: 4 }, { cellValue: 3 }, { cellValue: 2 }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(9.9696766801485, 6)
  })

  it('should evaluate to #NUM! if values in range are not numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:C1, D1:E1)' }, { cellValue: 1 }, { cellValue: null }, { cellValue: 3}, {cellValue: null }],
      [{ cellValue: '=XNPV(1, B2:C2, D2:E2)'}, { cellValue:  1}, { cellValue: 2}, { cellValue: 3.1}, { cellValue: true}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })

  /**
   * Product #1 tries to match the values in ranges.
   */
  it('should evaluate to #NUM! if ranges are of different length', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:C1, D1:F1)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 5 }],
      [{ cellValue: '=XNPV(1, B2:D2, E2:F2)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 5 }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.EqualLength))
  })

  it('should evaluate to #NUM! if dates are in wrong order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:C1, D1:E1)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 4}, {cellValue: 3 }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('should evaluate to #NUM! if dates are too small', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=XNPV(1, B1:C1, D1:E1)'}, { cellValue: 1}, { cellValue: 2}, { cellValue: -1}, { cellValue: 4}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
