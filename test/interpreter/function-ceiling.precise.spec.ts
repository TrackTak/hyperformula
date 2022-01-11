import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CEILING.PRECISE', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING.PRECISE()' }],
      [{ cellValue: '=CEILING.PRECISE(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING.PRECISE(1, "bar")' }],
      [{ cellValue: '=CEILING.PRECISE("bar", 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING.PRECISE(4.43, 0.3)' }],
      [{ cellValue: '=CEILING.PRECISE(4.43, 0.6)' }],
      [{ cellValue: '=CEILING.PRECISE(4.43, 2)' }],
      [{ cellValue: '=CEILING.PRECISE(-3.14, -1.8)' }],
      [{ cellValue: '=CEILING.PRECISE(-3.14, 0)' }],
      [{ cellValue: '=CEILING.PRECISE(3.14, 0)' }],
      [{ cellValue: '=CEILING.PRECISE(3.14)' }],
      [{ cellValue: '=CEILING.PRECISE(-3.14)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4.5)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4.8)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-1.8)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(-3)
  })

  it('negative values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CEILING.PRECISE(11, 2)' }],
      [{ cellValue: '=CEILING.PRECISE(-11, 2)' }],
      [{ cellValue: '=CEILING.PRECISE(11, -2)' }],
      [{ cellValue: '=CEILING.PRECISE(-11, -2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-10)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(-10)
  })
})
