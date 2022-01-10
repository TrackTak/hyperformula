import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function REPLACE', () => {
  it('should take 4 parameters', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 1, 2)' }],
      [{ cellValue: '=REPLACE("foobar", 1, 2, "baz", 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should replace characters in text based on given position and number of chars', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 2, 2, "uu")' }],
      [{ cellValue: '=REPLACE("foobar", 2, 10, "uu")' }],
      [{ cellValue: '=REPLACE("foobar", 3, 2, "uuuu")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('fuubar')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('fuu')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('fouuuuar')
  })

  it('should insert text before position if number of chars is 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 4, 0, "uu")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('foouubar')
  })

  it('should append new text if start position is greater than text length', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 7, 15, "uu")' }],
      [{ cellValue: '=REPLACE("foobar", 28, 0, "uu")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('foobaruu')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foobaruu')
  })

  it('should coerce', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 1, 3, TRUE())' }],
      [{ cellValue: '=REPLACE(12345, 3, 2, 123)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('TRUEbar')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('121235')
  })

  it('should return #VALUE! if parameters out of range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", 0, 2, TRUE())' }],
      [{ cellValue: '=REPLACE("foobar", 1, -1, "uu")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NegativeLength))
  })

  it('should return value when arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=REPLACE("foobar", "o", 1, "bar")' }],
      [{ cellValue: '=REPLACE("foobar", 1, "f", "bar")' }],
      [{ cellValue: '=REPLACE(B1:B2, 1, 2, "bar")' }],
      [{ cellValue: '=REPLACE("foobar", 1, 2, B1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
