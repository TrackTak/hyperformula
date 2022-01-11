import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function GCD', () => {
  it('checks required number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('computes correct answer for two args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(2*3*5,3*5*7)' }, { cellValue: '=GCD(0,1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3 * 5)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('computes correct answer for more than two args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(2*3*5,3*5*7, 2*5*7)' }, { cellValue: '=GCD(100,101,102,103,104)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(5)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('works with zeroes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(2*3*5,3*5*7, 2*5*7, 0, 0, 0)' }, { cellValue: '=GCD(0, 0, 100,101,102,103,104, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(5)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('accepts single arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(1)' }, { cellValue: '=GCD(0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(0)
  })

  it('coerces to number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD("2",4)' }],
      [{ cellValue: '=GCD(B2:C2)' }, { cellValue: '\'2' }, { cellValue: 4 }],
      [{ cellValue: '=GCD(TRUE(),4)' }],
      [{ cellValue: '=GCD(B4:C4)' }, { cellValue: true }, { cellValue: 4 }],
      [{ cellValue: '=GCD(,4)' }],
      [{ cellValue: '=GCD(B6:C6)' }, { cellValue: null }, { cellValue: 4 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(4)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(4)
  })

  it('ignores non-coercible values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(B1:C1)' }, { cellValue: 'abcd' }, { cellValue: 4 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(4)
  })

  it('throws error for non-coercible values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD("abcd",4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('handles overflow', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(1000000000000000000.0)' }],
    ]})

    //inconsistency with product #1
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(-1,5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('truncates numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(B1:C1)' }, { cellValue: 5.5 }, { cellValue: 10 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(5)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=GCD(NA(),4)' }],
      [{ cellValue: '=GCD(B2:C2)' }, { cellValue: '=NA()' }, { cellValue: 4 }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
