import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SUBSTITUTE', () => {
  it('should take three or four parameters', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foo", "f")' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "uu", 4, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should substitute new text for all occurrences of old text in a string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foo", "f", "bb")' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "uu")' }],
      [{ cellValue: '=SUBSTITUTE("fooobar", "oo", "x")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('bboo')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('fuuuubar')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('fxobar')
  })

  it('should substitute new text for nth occurrence of a string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "f", 1)' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "OO", 2)' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "OO", 3)' }],
      [{ cellValue: '=SUBSTITUTE("fofofofofo", "o", "u", 4)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('ffobar')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foOObar')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('foobar')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('fofofofufo')
  })

  it('should coerce', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foobar", "o", TRUE(), 1)' }],
      [{ cellValue: '=SUBSTITUTE("fooTRUE", TRUE(), 5, 1)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('fTRUEobar')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foo5')
  })

  it('should return value when last argument is less than one', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "f", 0)' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "OO", -1)' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
  })

  it('should return value when arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUBSTITUTE("foobar", "o", "f", "bar")' }],
      [{ cellValue: '=SUBSTITUTE(B1:C1, "o", "f", 3)' }],
      [{ cellValue: '=SUBSTITUTE("foobar", B1:C1, "f", 3)' }],
      [{ cellValue: '=SUBSTITUTE("foobar", "o", B1:C1, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
