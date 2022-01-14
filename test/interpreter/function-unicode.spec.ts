import {CellValueType, ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function UNICODE', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE()' }],
      [{ cellValue: '=UNICODE("foo", "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for empty strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE("")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EmptyString))
  })

  it('should work for single chars', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE("")' }],
      [{ cellValue: '=UNICODE("!")' }],
      [{ cellValue: '=UNICODE("A")' }],
      [{ cellValue: '=UNICODE("Z")' }],
      [{ cellValue: '=UNICODE("Ñ")' }],
      [{ cellValue: '=UNICODE("ÿ")' }],
      [{ cellValue: '=UNICODE(TRUE())' }],
      [{ cellValue: '=UNICODE("€")' }],
      [{ cellValue: '=UNICODE("􏿿")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(33)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(65)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(90)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(209)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(255)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(84)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(8364)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(1114111)
  })

  it('should return code of first character', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE("Abar")' }],
      [{ cellValue: '=UNICODE("Ñbaz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(65)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(209)
  })

  it('should return number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE("foo")' }]
    ]})

    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
  })

  it('should be identity when composed with UNICHAR', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=UNICODE(UNICHAR(1))' }],
      [{ cellValue: '=UNICODE(UNICHAR(128))' }],
      [{ cellValue: '=UNICODE(UNICHAR(256))' }],
      [{ cellValue: '=UNICODE(UNICHAR(8364))' }],
      [{ cellValue: '=UNICODE(UNICHAR(1114111))' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(128)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(256)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(8364)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(1114111)
  })
})
