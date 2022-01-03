import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LOGNORM.INV', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOGNORM.INV(1, 2)' }],
      [{ cellValue: '=LOGNORM.INV(1, 2, 3, 4)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOGNORM.INV("foo", 2, 3)' }],
      [{ cellValue: '=LOGNORM.INV(0.5, "baz", 3)' }],
      [{ cellValue: '=LOGNORM.INV(0.5, 2, "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOGNORM.INV(0.1, 1, 2)' }],
      [{ cellValue: '=LOGNORM.INV(0.5, 2, 4)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.209485002124057, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(7.38905609893065, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LOGNORM.INV(0.01, 0, 0.01)' }],
      [{ cellValue: '=LOGNORM.INV(0, 0, 0.01)' }],
      [{ cellValue: '=LOGNORM.INV(0.01, 0, 0)' }],
      [{ cellValue: '=LOGNORM.INV(0.99, 0, 0.01)' }],
      [{ cellValue: '=LOGNORM.INV(1, 0, 0.01)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.977005029803317, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(1.0235361840474, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
