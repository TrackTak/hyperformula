import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function BITLSHIFT', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(101)' }],
      [{ cellValue: '=BITLSHIFT(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(1, "foo")' }],
      [{ cellValue: '=BITLSHIFT("bar", 4)' }],
      [{ cellValue: '=BITLSHIFT("foo", "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should not work for negative value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(-5, -2)' }],
      [{ cellValue: '=BITLSHIFT(-1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('should work for positive positions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(0, 0)' }],
      [{ cellValue: '=BITLSHIFT(0, 2)' }],
      [{ cellValue: '=BITLSHIFT(2, 2)' }],
      [{ cellValue: '=BITLSHIFT(123, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(0)
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
    expect(engine.getCellValue(adr('A3'))).toEqual(8)
    expect(engine.getCellValue(adr('A4'))).toEqual(984)
  })

  it('should work for negative positions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(0, -2)' }, { cellValue: '=BITRSHIFT(0, 2)' }],
      [{ cellValue: '=BITLSHIFT(2, -5)' }, { cellValue: '=BITRSHIFT(2, 5)' }],
      [{ cellValue: '=BITLSHIFT(123, -2)' }, { cellValue: '=BITRSHIFT(123, 2)' }],
      [{ cellValue: '=BITLSHIFT(4786, -3)' }, { cellValue: '=BITRSHIFT(4786, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(0)
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
    expect(engine.getCellValue(adr('A3'))).toEqual(30)
    expect(engine.getCellValue(adr('A4'))).toEqual(598)

    expect(engine.getCellValue(adr('A1'))).toEqual(engine.getCellValue(adr('B1')))
    expect(engine.getCellValue(adr('A2'))).toEqual(engine.getCellValue(adr('B2')))
    expect(engine.getCellValue(adr('A3'))).toEqual(engine.getCellValue(adr('B3')))
    expect(engine.getCellValue(adr('A4'))).toEqual(engine.getCellValue(adr('B4')))
  })

  it('works only for 48 bit results', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(2, 46)' }],
      [{ cellValue: '=BITLSHIFT(2, 47)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(140737488355328)
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.BitshiftLong))
  })

  it('works only for positions from -53 to 53', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BITLSHIFT(0, -54)' }],
      [{ cellValue: '=BITLSHIFT(0, -53)' }],
      [{ cellValue: '=BITLSHIFT(0, 53)' }],
      [{ cellValue: '=BITLSHIFT(0, 54)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
    expect(engine.getCellValue(adr('A3'))).toEqual(0)
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
