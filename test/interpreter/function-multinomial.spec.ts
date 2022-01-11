import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MULTINOMIAL', () => {
  it('checks required number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('computes correct answer for two args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(6,8)' }, { cellValue: '=MULTINOMIAL(0,0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3003)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('computes correct answer for more than two args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(2,3,5,7)' }, { cellValue: '=MULTINOMIAL(10,11,12,13,14)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(49008960)
    expect(engine.getCellValue(adr('B1')).cellValue as number / 2.20917676017678e+38).toBeCloseTo(1, 6)
  })

  it('accepts single arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(1000)' }, { cellValue: '=MULTINOMIAL(0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
  })

  it('coerces to number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL("2",4)' }],
      [{ cellValue: '=MULTINOMIAL(B2:C2)' }, { cellValue: '\'2' }, { cellValue: 4 }],
      [{ cellValue: '=MULTINOMIAL(TRUE(),4)' }],
      [{ cellValue: '=MULTINOMIAL(B4:C4)' }, { cellValue: true }, { cellValue: 4 }],
      [{ cellValue: '=MULTINOMIAL(,4)' }],
      [{ cellValue: '=MULTINOMIAL(B6:C6)' }, { cellValue: null }, { cellValue: 4 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(15)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(15)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(5)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(5)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(1)
  })

  it('throws error for non-coercible values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(B1:C1)' }, { cellValue: 'abcd' }, { cellValue: 4 }],
      [{ cellValue: '=MULTINOMIAL("abcd",4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(-1,5)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })

  it('truncates numbers', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(B1:C1)' }, { cellValue: 5.5 }, { cellValue: 10.9 }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3003)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MULTINOMIAL(NA(),4)' }],
      [{ cellValue: '=MULTINOMIAL(B2:C2)' }, { cellValue: '=NA()' }, { cellValue: 4 }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
