import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('F.TEST', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.TEST(1)' }],
      [{ cellValue: '=F.TEST(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '=F.TEST(A1:A2, B1:B2)' }]
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.2513318328, 6)
  })

  it('works for uneven ranges', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: null }, { cellValue: '1' }],
      [{ cellValue: '=F.TEST(A1:A2, B1:B3)' }]
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(0.794719414238988, 6)
  })

  it('doesnt do coercions, nonnumeric values are skipped', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '5' }, { cellValue: '3' }],
      [{ cellValue: null }, { cellValue: '6' }],
      [{ cellValue: true }, { cellValue: false }],
      [{ cellValue: '8' }],
      [{ cellValue: '=F.TEST(A1:A4, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(1, 6)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=4/0' }, { cellValue: '50' }],
      [{ cellValue: '3' }, { cellValue: '30' }],
      [{ cellValue: '=F.TEST(A1:A3, B1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('error when not enough data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.TEST(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('error when 0 variance', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.TEST(A2:C2, A3:C3)' }],
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }],
      [{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 0 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
