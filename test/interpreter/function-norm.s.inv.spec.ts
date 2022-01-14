import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NORM.S.INV', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.INV()' }],
      [{ cellValue: '=NORM.S.INV(3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.INV("foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.INV(0.9)' }],
      [{ cellValue: '=NORM.S.INV(0.5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.2815515655446, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.S.INV(0.01)' }],
      [{ cellValue: '=NORM.S.INV(0)' }],
      [{ cellValue: '=NORM.S.INV(0.99)' }],
      [{ cellValue: '=NORM.S.INV(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-2.32634787404084, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(2.32634787404084, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
