import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function BESSELJ', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELJ(1)' }],
      [{ cellValue: '=BESSELJ(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELJ("foo", 1)' }],
      [{ cellValue: '=BESSELJ(2, "foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELJ(-1,0)' }],
      [{ cellValue: '=BESSELJ(0,0)' }],
      [{ cellValue: '=BESSELJ(5,0)' }],
      [{ cellValue: '=BESSELJ(-1,1)' }],
      [{ cellValue: '=BESSELJ(0,1)' }],
      [{ cellValue: '=BESSELJ(5,1)' }],
      [{ cellValue: '=BESSELJ(-1,3)' }],
      [{ cellValue: '=BESSELJ(0,3)' }],
      [{ cellValue: '=BESSELJ(5,3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.765197683754859, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.00000000283141, 9)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-0.177596774112343, 6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(-0.44005058567713, 6)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(-0.327579138566363, 6)
    expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(-0.019563353982688, 6)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A9')).cellValue).toBeCloseTo(0.364831233515002, 6)
  })

  it('should check bounds', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELJ(1, -0.001)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))

  })

  it('should truncate second argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BESSELJ(-1,0.9)' }],
      [{ cellValue: '=BESSELJ(0,0.9)' }],
      [{ cellValue: '=BESSELJ(5,0.9)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.765197683754859, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(1.00000000283141, 9)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(-0.177596774112343, 6)
  })
})
