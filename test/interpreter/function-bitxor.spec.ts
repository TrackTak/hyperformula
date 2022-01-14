import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('function BITXOR', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(101)' }],
      [{ cellValue: '=BITXOR(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(1, "foo")' }],
      [{ cellValue: '=BITXOR("bar", 4)' }],
      [{ cellValue: '=BITXOR("foo", "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should not work for negative numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(1, -2)' }],
      [{ cellValue: '=BITXOR(-1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('should not work for non-integers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(1.2, 2)' }],
      [{ cellValue: '=BITXOR(3.14, 5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.IntegerExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.IntegerExpected))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(1, 5)' }],
      [{ cellValue: '=BITXOR(457, 111)' }],
      [{ cellValue: '=BITXOR(BIN2DEC(101), BIN2DEC(1))' }],
      [{ cellValue: '=BITXOR(256, 123)' }],
      [{ cellValue: '=BITXOR(0, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(422)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(379)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
  })

  it('should return numeric type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BITXOR(1, 5)' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
  })
})
