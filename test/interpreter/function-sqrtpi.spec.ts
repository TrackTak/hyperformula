import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SQRTPI', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SQRTPI()' }, { cellValue: '=SQRTPI(1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SQRTPI(0)' }],
      [{ cellValue: '=SQRTPI(1)' }],
      [{ cellValue: '=SQRTPI(PI())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.77245385090552, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(3.14159265358979, 6)
  })

  it('pass error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SQRTPI(NA())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
