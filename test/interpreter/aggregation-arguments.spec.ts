import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('AVERAGE function', () => {
  it('should work for empty arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(1,)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })

  it('should work for empty reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2,B2)' }],
      [{ cellValue: 1 }, { cellValue: null }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('should work for range with empty val', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2:B2)' }],
      [{ cellValue: 1 }, { cellValue: null }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('should work for empty reference + empty arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2,B2,)' }],
      [{ cellValue: 1 }, { cellValue: null }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })

  it('should work for range with empty val + empty arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2:B2,)' }],
      [{ cellValue: 1 }, { cellValue: null }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.5)
  })

  it('should work for coercible arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(2,TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1.5)
  })

  it('should work for coercible value in reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2,B2)' }],
      [{ cellValue: 2 }, { cellValue: true }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('should work for coercible value in range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=AVERAGE(A2:B2)' }],
      [{ cellValue: 2 }, { cellValue: true }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })
})
