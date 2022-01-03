import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Z.TEST', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=Z.TEST(1)' }],
      [{ cellValue: '=Z.TEST(1, 2, 3, 4)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works (no sigma)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=Z.TEST(A2:D2, 1)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.0100683757751732, 6)
  })

  it('works (with sigma)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=Z.TEST(A2:D2, 1, 1)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.0013498980316301, 6)
  })

  it('validates input', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=Z.TEST(B1:C1, 1)' }, { cellValue: 1 }, { cellValue: null }],
      [{ cellValue: '=Z.TEST(B2:C2, 1, 1)' }, { cellValue: null }, { cellValue: null }],
      [{ cellValue: '=Z.TEST(B3:C3, 1)' }, { cellValue: 1 }, { cellValue: 1 }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO, ErrorMessage.TwoValues))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.OneValue))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('doesnt do coercions, nonnumeric values are skipped', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=Z.TEST(B1:E1, 1, 1)' }, { cellValue: null }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }],
      [{ cellValue: '=Z.TEST(B2:E2, 1, 1)' }, { cellValue: true }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.000266002752569605, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.000266002752569605, 6)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=NA()' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=Z.TEST(A1:B3, 1, 1)' }],
    ])
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
