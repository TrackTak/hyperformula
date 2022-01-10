import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function NORM.INV', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.INV(1, 2)' }],
      [{ cellValue: '=NORM.INV(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.INV("foo", 2, 3)' }],
      [{ cellValue: '=NORM.INV(0.5, "baz", 3)' }],
      [{ cellValue: '=NORM.INV(0.5, 2, "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.INV(0.9, 1, 2)' }],
      [{ cellValue: '=NORM.INV(0.5, 2, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(3.5631031310892, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=NORM.INV(0.5, -1, 0.01)' }],
      [{ cellValue: '=NORM.INV(0.5, -1, 0)' }],
      [{ cellValue: '=NORM.INV(0.01, -1, 0.01)' }],
      [{ cellValue: '=NORM.INV(0, -1, 0.01)' }],
      [{ cellValue: '=NORM.INV(0.99, -1, 0.01)' }],
      [{ cellValue: '=NORM.INV(1, -1, 0.01)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-1.02326347874041, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(-0.976736521259592, 6)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
