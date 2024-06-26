import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function BINOM.INV', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BINOM.INV(1, 2)' }],
      [{ cellValue: '=BINOM.INV(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BINOM.INV("foo", 0.5, 3)' }],
      [{ cellValue: '=BINOM.INV(1, "baz", 3)' }],
      [{ cellValue: '=BINOM.INV(1, 0.5, "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const formulas = [
      [
        '=BINOM.INV(10, 0.5, 0.001)',
        '=BINOM.INV(10, 0.5, 0.01)',
        '=BINOM.INV(10, 0.5, 0.025)',
        '=BINOM.INV(10, 0.5, 0.05)',
        '=BINOM.INV(10, 0.5, 0.1)',
        '=BINOM.INV(10, 0.5, 0.2)',
        '=BINOM.INV(10, 0.5, 0.3)',
        '=BINOM.INV(10, 0.5, 0.4)',
        '=BINOM.INV(10, 0.5, 0.5)',
        '=BINOM.INV(10, 0.5, 0.6)',
        '=BINOM.INV(10, 0.5, 0.7)',
        '=BINOM.INV(10, 0.5, 0.8)',
        '=BINOM.INV(10, 0.5, 0.9)',
        '=BINOM.INV(10, 0.5, 0.95)',
        '=BINOM.INV(10, 0.5, 0.975)',
        '=BINOM.INV(10, 0.5, 0.99)',
        '=BINOM.INV(10, 0.5, 0.999)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    const out = [[1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 7, 8, 8, 9, 9]].map(x => x.map(z => ({
      cellValue: z
    })))
    
    expect(engine.getSheetValues(0).cells).toEqual(out)
  })

  it('should work, different p-value', () => {
    const formulas = [
      ['=BINOM.INV(10, 0.8, 0.001)',
        '=BINOM.INV(10, 0.8, 0.1)',
        '=BINOM.INV(10, 0.8, 0.2)',
        '=BINOM.INV(10, 0.8, 0.3)',
        '=BINOM.INV(10, 0.8, 0.4)',
        '=BINOM.INV(10, 0.8, 0.5)',
        '=BINOM.INV(10, 0.8, 0.6)',
        '=BINOM.INV(10, 0.8, 0.7)',
        '=BINOM.INV(10, 0.8, 0.8)',
        '=BINOM.INV(10, 0.8, 0.9)',
        '=BINOM.INV(10, 0.8, 0.999)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 4 }, { cellValue: 6 }, { cellValue: 7 }, { cellValue: 7}, {cellValue: 8 }, { cellValue: 8 }, { cellValue: 8 }, { cellValue: 9 }, { cellValue: 9 }, { cellValue: 10 }, { cellValue: 10 }]])
  })

  it('should work, small number of trials', () => {
    const formulas = [
      ['=BINOM.INV(0, 0.8, 0.001)',
        '=BINOM.INV(0, 0.8, 0.1)',
        '=BINOM.INV(0, 0.8, 0.2)',
        '=BINOM.INV(0, 0.8, 0.3)',
        '=BINOM.INV(0, 0.8, 0.4)',
        '=BINOM.INV(0, 0.8, 0.5)',
        '=BINOM.INV(0, 0.8, 0.6)',
        '=BINOM.INV(0, 0.8, 0.7)',
        '=BINOM.INV(0, 0.8, 0.8)',
        '=BINOM.INV(0, 0.8, 0.9)',
        '=BINOM.INV(0, 0.8, 0.999)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 0}, {cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }]])
  })

  it('should work, another small number of trials', () => {
    const formulas = [
      ['=BINOM.INV(1, 0.8, 0.001)',
        '=BINOM.INV(1, 0.8, 0.1)',
        '=BINOM.INV(1, 0.8, 0.2)',
        '=BINOM.INV(1, 0.8, 0.3)',
        '=BINOM.INV(1, 0.8, 0.4)',
        '=BINOM.INV(1, 0.8, 0.5)',
        '=BINOM.INV(1, 0.8, 0.6)',
        '=BINOM.INV(1, 0.8, 0.7)',
        '=BINOM.INV(1, 0.8, 0.8)',
        '=BINOM.INV(1, 0.8, 0.9)',
        '=BINOM.INV(1, 0.8, 0.999)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    //both products #1 and #2 return 1 for '=BINOM.INV(1, 0.8, 0.2)', which is incorrect
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 0 }, { cellValue: 0 }, { cellValue: 0 }, { cellValue: 1}, {cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }]])
  })

  it('should work, large number of trials', () => {
    const formulas = [
      ['=BINOM.INV(1000, 0.8, 0.001)',
        '=BINOM.INV(1000, 0.8, 0.1)',
        '=BINOM.INV(1000, 0.8, 0.2)',
        '=BINOM.INV(1000, 0.8, 0.3)',
        '=BINOM.INV(1000, 0.8, 0.4)',
        '=BINOM.INV(1000, 0.8, 0.5)',
        '=BINOM.INV(1000, 0.8, 0.6)',
        '=BINOM.INV(1000, 0.8, 0.7)',
        '=BINOM.INV(1000, 0.8, 0.8)',
        '=BINOM.INV(1000, 0.8, 0.9)',
        '=BINOM.INV(1000, 0.8, 0.999)'],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 760 }, { cellValue: 784 }, { cellValue: 789 }, { cellValue: 793}, {cellValue: 797 }, { cellValue: 800 }, { cellValue: 803 }, { cellValue: 807 }, { cellValue: 811 }, { cellValue: 816 }, { cellValue: 838 }]])
  })

  it('truncation works', () => {
    const formulas = [
      ['=BINOM.INV(1000.1, 0.8, 0.001)',
      '=BINOM.INV(1000.2, 0.8, 0.1)',
      '=BINOM.INV(1000.3, 0.8, 0.2)',
      '=BINOM.INV(1000.4, 0.8, 0.3)',
      '=BINOM.INV(1000.5, 0.8, 0.4)',
      '=BINOM.INV(1000.6, 0.8, 0.5)',
      '=BINOM.INV(1000.7, 0.8, 0.6)',
      '=BINOM.INV(1000.8, 0.8, 0.7)',
      '=BINOM.INV(1000.9, 0.8, 0.8)',
      '=BINOM.INV(1000.99, 0.8, 0.9)',
      '=BINOM.INV(1000.999, 0.8, 0.999)'],

    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 760 }, { cellValue: 784 }, { cellValue: 789 }, { cellValue: 793}, {cellValue: 797 }, { cellValue: 800 }, { cellValue: 803 }, { cellValue: 807 }, { cellValue: 811 }, { cellValue: 816 }, { cellValue: 838 }]])
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=BINOM.INV(0, 0.5, 0.5)' }],
      [{ cellValue: '=BINOM.INV(-0.001, 0.5, 0.5)' }],
      [{ cellValue: '=BINOM.INV(10, 0, 0.5)' }],
      [{ cellValue: '=BINOM.INV(10, 1, 0.5)' }],
      [{ cellValue: '=BINOM.INV(10, -0.001, 0.5)' }],
      [{ cellValue: '=BINOM.INV(10, 1.001, 0.5)' }],
      [{ cellValue: '=BINOM.INV(10, 0.5, 0)' }],
      [{ cellValue: '=BINOM.INV(10, 0.5, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    //product #1 returns 0 for the following test
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    //both products #1 and #2 return NUM for '=BINOM.INV(10, 0, 0.5)', which is incorrect
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
    //both products #1 and #2 return NUM for '=BINOM.INV(10, 1, 0.5)', which is incorrect
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(10)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A7')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A8')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
