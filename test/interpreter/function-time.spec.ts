import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {Config} from '../../src/Config'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError, timeNumberToString} from '../testUtils'

describe('Function TIME', () => {
  it('with 3 numerical arguments', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(0, 0, 0)' }, { cellValue: '=TIME(21, 0, 54)' }, { cellValue: '=TIME(3, 10, 24)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(timeNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('00:00:00')
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_TIME)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0.875625)
    expect(timeNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('21:00:54')
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(0.132222222222222)
    expect(timeNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('03:10:24')
  })

  it('truncation', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(0.9, 0, 0)' }, { cellValue: '=TIME(21, 0.5, 54)' }, { cellValue: '=TIME(3, 10, 24.99)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(timeNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('00:00:00')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0.875625)
    expect(timeNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('21:00:54')
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(0.132222222222222)
    expect(timeNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('03:10:24')
  })

  it('rollover', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(24, 0, 0)' }, { cellValue: '=TIME(19, 120, 54)' }, { cellValue: '=TIME(0, 189, 84)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(timeNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('00:00:00')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0.875625)
    expect(timeNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('21:00:54')
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(0.132222222222222)
    expect(timeNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('03:10:24')
  })

  it('negative', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(-1, 59, 0)' }, { cellValue: '=TIME(0, -1, 59)' }, { cellValue: '=TIME(0, 1, -61)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NegativeTime))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NegativeTime))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.NegativeTime))
  })

  it('fractions', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(0, 0.9, 0)' }, { cellValue: '=TIME(0, 0, -0.9)' }, { cellValue: '=TIME(0.9, 0, 0)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })

  it('number of arguments', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(0, 1)' }],
      [{ cellValue: '=TIME(0, 1, 1, 1)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with incoercible argument', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME("foo", 1, 1)' }],
      [{ cellValue: '=TIME(0, "foo", 1)' }],
      [{ cellValue: '=TIME(0, 1, "foo")' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('with coercible argument', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="0"' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=TIME(A1, 1, 1)' }],
      [{ cellValue: '=TIME(0, B1, 1)' }],
      [{ cellValue: '=TIME(0, 1, B1)' }],
    ]}, config)
    expect(timeNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('00:01:01')
    expect(timeNumberToString(engine.getCellValue(adr('A3')).cellValue, config)).toEqual('00:01:01')
    expect(timeNumberToString(engine.getCellValue(adr('A4')).cellValue, config)).toEqual('00:01:01')
  })

  it('precedence of errors', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIME(FOOBAR(), 4/0, 1)' }],
      [{ cellValue: '=TIME(0, FOOBAR(), 4/0)' }],
      [{ cellValue: '=TIME(0, 1, FOOBAR())' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })
})

