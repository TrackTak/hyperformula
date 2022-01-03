import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FIND', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND()' }],
      [{ cellValue: '=FIND("foo")' }],
      [{ cellValue: '=FIND("foo", 1, 2, 3)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return VALUE when wrong type of third parameter', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND("foo", "bar", "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should return VALUE if third parameter is not between 1 and text length', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND("foo", "bar", 0)' }],
      [{ cellValue: '=FIND("foo", "bar", -1)' }],
      [{ cellValue: '=FIND("foo", "bar", 4)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND("f", "foo")' }],
      [{ cellValue: '=FIND("o", "foo")' }],
      [{ cellValue: '=FIND("o", "foo", 3)' }],
      [{ cellValue: '=FIND("g", "foo")' }],
      [{ cellValue: '=FIND("?o", "?o")' }],
      [{ cellValue: '=FIND("?o", "oo")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.PatternNotFound))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.PatternNotFound))
  })

  it('should be case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND("R", "bar")' }],
      [{ cellValue: '=FIND("r", "bar")' }],
      [{ cellValue: '=FIND("r", "baR")' }],
      [{ cellValue: '=FIND("R", "baR")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.PatternNotFound))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.PatternNotFound))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FIND(1, 1, 1)' }],
      [{ cellValue: '=FIND(0, 5+5)' }],
      [{ cellValue: '=FIND("U", TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
  })
})
