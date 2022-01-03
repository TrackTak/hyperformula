import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function UNICHAR', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UNICHAR()' }],
      [{ cellValue: '=UNICHAR(1, 2)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UNICHAR("foo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UNICHAR(1)' }],
      [{ cellValue: '=UNICHAR(33)' }],
      [{ cellValue: '=UNICHAR(65)' }],
      [{ cellValue: '=UNICHAR(90)' }],
      [{ cellValue: '=UNICHAR(209)' }],
      [{ cellValue: '=UNICHAR(255)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('!')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('A')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('Z')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('Ñ')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('ÿ')
  })

  it('should round down floats', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UNICHAR(42)' }],
      [{ cellValue: '=UNICHAR(42.2)' }],
      [{ cellValue: '=UNICHAR(42.8)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('*')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('*')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('*')
  })

  it('should work only for values from 1 to 1114111 truncating decimal part', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=UNICHAR(0)' }],
      [{ cellValue: '=UNICHAR(0.5)' }],
      [{ cellValue: '=UNICHAR(1)' }],
      [{ cellValue: '=UNICHAR(256)' }],
      [{ cellValue: '=UNICHAR(1114111)' }],
      [{ cellValue: '=UNICHAR(1114111.5)' }],
      [{ cellValue: '=UNICHAR(1114112)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('Ā')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('􏿿')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('􏿿')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds))
  })
})
