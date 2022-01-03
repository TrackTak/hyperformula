import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function BIN2DEC', () => {
  it('should work only for one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2DEC(101)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
  })

  it('should not work for non-binary arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2DEC("foo")' }],
      [{ cellValue: '=BIN2DEC(1234)' }],
      [{ cellValue: '=BIN2DEC(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
  })

  it('should work only for 10 bits', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2DEC(10101010101010)' }],
      [{ cellValue: '=BIN2DEC(1010101010)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NotBinary))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-342)
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2DEC(1111111111)' }],
      [{ cellValue: '=BIN2DEC(1000000000)' }],
      [{ cellValue: '=BIN2DEC(111111111)' }],
      [{ cellValue: '=BIN2DEC(101)' }],
      [{ cellValue: '=BIN2DEC(000101)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-512)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(511)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(5)

  })

  it('should work with references', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1101' }],
      [{ cellValue: '=BIN2DEC(A1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(13)
  })

  it('should return numeric type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=BIN2DEC(101)' }],
    ])
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.NUMBER)
  })
})
