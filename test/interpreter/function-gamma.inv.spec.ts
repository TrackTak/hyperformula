import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function GAMMA.INV', () => {

  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.INV(1, 2)' }],
      [{ cellValue: '=GAMMA.INV(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.INV("foo", 2, 3)' }],
      [{ cellValue: '=GAMMA.INV(0.5, "baz", 3)' }],
      [{ cellValue: '=GAMMA.INV(0.5, 2, "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.INV(0.5, 1, 1)' }],
      [{ cellValue: '=GAMMA.INV(0.9, 2, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.693147180559945, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(15.5588806794697, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GAMMA.INV(0, 1, 1)' }],
      [{ cellValue: '=GAMMA.INV(-0.00001, 1, 1)' }],
      [{ cellValue: '=GAMMA.INV(1, 1, 1)' }],
      [{ cellValue: '=GAMMA.INV(0, 0, 1)' }],
      [{ cellValue: '=GAMMA.INV(0, 1, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
