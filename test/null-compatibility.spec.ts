import {HyperFormula} from '../src'
import {adr} from './testUtils'

describe('null compatibility', () => {
  it('should evaluate empty reference to null', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }]], {evaluateNullToZero: false})
    expect(engine.getCellValue(adr('A1')).cellValue).toBeNull()
    expect(engine.getCellValue(adr('A2')).cellValue).toBeNull()
  })

  it('should evaluate empty reference to 0', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A2' }]], {evaluateNullToZero: true})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeNull()
  })

  it('should evaluate if to null', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IF(TRUE(),A2)' }]], {evaluateNullToZero: false})
    expect(engine.getCellValue(adr('A1')).cellValue).toBeNull()
    expect(engine.getCellValue(adr('A2')).cellValue).toBeNull()
  })

  it('should evaluate if to 0', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IF(TRUE(),A2)' }]], {evaluateNullToZero: true})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeNull()
  })

  it('should evaluate isblank with null', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2' }, { cellValue: '=ISBLANK(A1)' }],
      [{ cellValue: null }, { cellValue: '=ISBLANK(A2)' }]
    ], {evaluateNullToZero: false})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(true)
  })

  it('should evaluate isblank with 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=A2' }, { cellValue: '=ISBLANK(A1)' }],
      [{ cellValue: null }, { cellValue: '=ISBLANK(A2)' }]
    ], {evaluateNullToZero: true})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(true)
  })
})
