import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('decimal parsing', () => {
  it('parsing decimal without leading zero', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '.1' }, { cellValue: '=.1' }],
      [{ cellValue: '-.1' }, { cellValue: '=-.1' }],
      [{ cellValue: '+.1' }, { cellValue: '=+.1' }],
      [{ cellValue: '+.1' }, { cellValue: '=+.1+.2' }],
      [{ cellValue: '=SUM(A1:A4, 0.3, .3)' }, { cellValue: '=SUM(B1:B4)' }],
      [{ cellValue: '.1.4' }, { cellValue: '=..1' }],
      [{ cellValue: '1.' }, { cellValue: '=1.' }],
      [{ cellValue: '1e1' }, { cellValue: '=1e1' }],
      [{ cellValue: '1e+1' }, { cellValue: '=1e+1' }],
      [{ cellValue: '1e-1' }, { cellValue: '=1e-1' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(-0.1)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(-0.1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(0.3)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(0.8)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(0.4)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe('.1.4')
    expect(engine.getCellValue(adr('B6')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B7')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('B8')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A9')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('B9')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('A10')).cellValue).toBe(0.1)
    expect(engine.getCellValue(adr('B10')).cellValue).toBe(0.1)
  })
})
