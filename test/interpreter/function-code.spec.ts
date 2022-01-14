import {CellValueType, ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function CODE', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE()' }],
      [{ cellValue: '=CODE("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for empty strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE("")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EmptyString))
  })

  it('should work for single chars', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE("")' }],
      [{ cellValue: '=CODE("!")' }],
      [{ cellValue: '=CODE("A")' }],
      [{ cellValue: '=CODE("Z")' }],
      [{ cellValue: '=CODE("Ñ")' }],
      [{ cellValue: '=CODE("ÿ")' }],
      [{ cellValue: '=CODE(TRUE())' }],
      [{ cellValue: '=CODE("€")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(33)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(65)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(90)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(209)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(255)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(84)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8364)
  })

  it('should return code of first character', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE("Abar")' }],
      [{ cellValue: '=CODE("Ñbaz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(65)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(209)
  })

  it('should return number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE("foo")' }]
    ]})

    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
  })

  it('should be identity when composed with CHAR', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=CODE(CHAR(1))' }],
      [{ cellValue: '=CODE(CHAR(128))' }],
      [{ cellValue: '=CODE(CHAR(255))' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(128)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(255)
  })
})
