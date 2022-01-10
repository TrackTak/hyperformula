import {HyperFormula} from '../../src'
import {CellValueType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DELTA', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DELTA()' }],
      [{ cellValue: '=DELTA(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DELTA("foo")' }],
      [{ cellValue: '=DELTA(1, "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should compare to 0 if one argument provided', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DELTA(0)' }],
      [{ cellValue: '=DELTA("123")' }],
      [{ cellValue: '=DELTA(FALSE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('should compare two arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DELTA(1, 0)' }],
      [{ cellValue: '=DELTA(2, 2)' }],
      [{ cellValue: '=DELTA(123, "123")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('should return number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DELTA(3, 3)' }],
      [{ cellValue: '=DELTA("123")' }],
    ]})

    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
    expect(engine.getCellValueType(adr('A2'))).toEqual(CellValueType.NUMBER)
  })
})
