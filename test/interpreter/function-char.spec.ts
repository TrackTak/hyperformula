import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CHAR', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHAR()' }],
      [{ cellValue: '=CHAR(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHAR("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHAR(1)' }],
      [{ cellValue: '=CHAR(33)' }],
      [{ cellValue: '=CHAR(65)' }],
      [{ cellValue: '=CHAR(90)' }],
      [{ cellValue: '=CHAR(209)' }],
      [{ cellValue: '=CHAR(255)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual('')
    expect(engine.getCellValue(adr('A2'))).toEqual('!')
    expect(engine.getCellValue(adr('A3'))).toEqual('A')
    expect(engine.getCellValue(adr('A4'))).toEqual('Z')
    expect(engine.getCellValue(adr('A5'))).toEqual('Ñ')
    expect(engine.getCellValue(adr('A6'))).toEqual('ÿ')
  })

  it('should round down floats', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHAR(42)' }],
      [{ cellValue: '=CHAR(42.2)' }],
      [{ cellValue: '=CHAR(42.8)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual('*')
    expect(engine.getCellValue(adr('A2'))).toEqual('*')
    expect(engine.getCellValue(adr('A3'))).toEqual('*')
  })

  it('should work only for values from 1 to 255 truncating decimal part', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHAR(0)' }],
      [{ cellValue: '=CHAR(1)' }],
      [{ cellValue: '=CHAR(255)' }],
      [{ cellValue: '=CHAR(256)' }],
      [{ cellValue: '=CHAR(0.5)' }],
      [{ cellValue: '=CHAR(255.5)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
    expect(engine.getCellValue(adr('A2'))).toEqual('')
    expect(engine.getCellValue(adr('A3'))).toEqual('ÿ')
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
    expect(engine.getCellValue(adr('A6'))).toEqual('ÿ')
  })
})
