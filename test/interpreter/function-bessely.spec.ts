import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function BESSELY', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BESSELY(1)' }],
      [{ cellValue: '=BESSELY(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BESSELY("foo", 1)' }],
      [{ cellValue: '=BESSELY(2, "foo")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BESSELY(0.1,0)' }],
      [{ cellValue: '=BESSELY(1,0)' }],
      [{ cellValue: '=BESSELY(5,0)' }],
      [{ cellValue: '=BESSELY(0.1,1)' }],
      [{ cellValue: '=BESSELY(1,1)' }],
      [{ cellValue: '=BESSELY(5,1)' }],
      [{ cellValue: '=BESSELY(0.1,3)' }],
      [{ cellValue: '=BESSELY(1,3)' }],
      [{ cellValue: '=BESSELY(5,3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-1.53423866134966, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0882569713977081, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-0.308517623032057, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(-6.45895109099111, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(-0.78121282095312, 6)
    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(0.147863139887343, 6)
    expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(-5099.33237524791, 6)
    expect(engine.getCellValue(adr('A8')).cellValue).toBeCloseTo(-5.82151763226267, 6)
    expect(engine.getCellValue(adr('A9')).cellValue).toBeCloseTo(0.146267163302253, 6)
  })

  it('should check bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BESSELY(1, -0.001)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))

  })

  it('should truncate second argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BESSELY(0.1,0.9)' }],
      [{ cellValue: '=BESSELY(1,0.9)' }],
      [{ cellValue: '=BESSELY(5,0.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(-1.53423866134966, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0882569713977081, 6)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-0.308517623032057, 6)
  })
})
