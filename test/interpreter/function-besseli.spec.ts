import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function BESSELI', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELI(1)' }],
      [{ cellValue: '=BESSELI(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELI("foo", 1)' }],
      [{ cellValue: '=BESSELI(2, "foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELI(-1,0)' }],
      [{ cellValue: '=BESSELI(0,0)' }],
      [{ cellValue: '=BESSELI(5,0)' }],
      [{ cellValue: '=BESSELI(-1,1)' }],
      [{ cellValue: '=BESSELI(0,1)' }],
      [{ cellValue: '=BESSELI(5,1)' }],
      [{ cellValue: '=BESSELI(-1,3)' }],
      [{ cellValue: '=BESSELI(0,3)' }],
      [{ cellValue: '=BESSELI(5,3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.26606584803426, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(27.2398718943949, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(-0.565159097581944, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(24.3356418457055, 6)
    expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(-0.0221684244039833, 6)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A9')).cellValue).toBeCloseTo(10.3311501959992, 6)
  })

  it('should check bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELI(1, -0.001)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))

  })

  it('should truncate second argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELI(-1,0.9)' }],
      [{ cellValue: '=BESSELI(0,0.9)' }],
      [{ cellValue: '=BESSELI(5,0.9)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.26606584803426, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(27.2398718943949, 6)
  })
})
