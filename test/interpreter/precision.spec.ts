import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('Imprecise comparisons', () => {

  it('less-than', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.00000000000005'
    const formulas = [
      ['=1<1' + chunk1, '=1<1' + chunk2],
      ['=1' + chunk1 + '<1', '=1' + chunk2 + '<1'],
      ['=-1' + chunk1 + '<-1', '=-1' + chunk2 + '<-1'],
      ['=-1<-1' + chunk1, '=-1<-1' + chunk2],
      ['=0<0' + chunk1, '=0<0' + chunk2],
      ['=0' + chunk1 + '<0', '=0' + chunk2 + '<0'],
      ['=-0' + chunk1 + '<0', '=-0' + chunk2 + '<0'],
      ['=0<-0' + chunk1, '=0<-0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B6')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B7')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B8')).cellValue).toBe(false)
  })

  it('greater-than', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.0000000000001'
    const formulas = [
      ['=1>1' + chunk1, '=1>1' + chunk2],
      ['=1' + chunk1 + '>1', '=1' + chunk2 + '>1'],
      ['=-1' + chunk1 + '>-1', '=-1' + chunk2 + '>-1'],
      ['=-1>-1' + chunk1, '=-1>-1' + chunk2],
      ['=0>0' + chunk1, '=0>0' + chunk2],
      ['=0' + chunk1 + '>0', '=0' + chunk2 + '>0'],
      ['=-0' + chunk1 + '>0', '=-0' + chunk2 + '>0'],
      ['=0>-0' + chunk1, '=0>-0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B6')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B7')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B8')).cellValue).toBe(true)
  })

  it('greater-equal', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.0000000000001'
    const formulas = [
      ['=1>=1' + chunk1, '=1>=1' + chunk2],
      ['=1' + chunk1 + '>=1', '=1' + chunk2 + '>=1'],
      ['=-1' + chunk1 + '>=-1', '=-1' + chunk2 + '>=-1'],
      ['=-1>=-1' + chunk1, '=-1>=-1' + chunk2],
      ['=0>=0' + chunk1, '=0>=0' + chunk2],
      ['=0' + chunk1 + '>=0', '=0' + chunk2 + '>=0'],
      ['=-0' + chunk1 + '>=0', '=-0' + chunk2 + '>=0'],
      ['=0>=-0' + chunk1, '=0>=-0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B6')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B7')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B8')).cellValue).toBe(true)
  })

  it('less-equal', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.0000000000001'
    const formulas = [
      ['=1<=1' + chunk1, '=1<=1' + chunk2],
      ['=1' + chunk1 + '<=1', '=1' + chunk2 + '<=1'],
      ['=-1' + chunk1 + '<=-1', '=-1' + chunk2 + '<=-1'],
      ['=-1<=-1' + chunk1, '=-1<=-1' + chunk2],
      ['=0<=0' + chunk1, '=0<=0' + chunk2],
      ['=0' + chunk1 + '<=0', '=0' + chunk2 + '<=0'],
      ['=-0' + chunk1 + '<=0', '=-0' + chunk2 + '<=0'],
      ['=0<=-0' + chunk1, '=0<=-0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B5')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B6')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B7')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B8')).cellValue).toBe(false)
  })
})

describe('Snap to zero', () => {

  it('minus', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.0000000000001'
    const formulas = [
      ['=1-1' + chunk1, '=1-1' + chunk2],
      ['=1' + chunk1 + '-1', '=1' + chunk2 + '-1'],
      ['=-1' + chunk1 + '--1', '=-1' + chunk2 + '--1'],
      ['=-1--1' + chunk1, '=-1--1' + chunk2],
      ['=0-0' + chunk1, '=0-0' + chunk2],
      ['=0' + chunk1 + '-0', '=0' + chunk2 + '-0'],
      ['=-0' + chunk1 + '-0', '=-0' + chunk2 + '-0'],
      ['=0--0' + chunk1, '=0--0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.dependencyGraph.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.dependencyGraph.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B2')).cellValue).toEqual(0)
    expect(engine.dependencyGraph.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.dependencyGraph.getCellValue(adr('A4')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B4')).cellValue).toEqual(0)
    expect(engine.dependencyGraph.getCellValue(adr('A5')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B5')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('A6')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B6')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('A7')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B7')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('A8')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.dependencyGraph.getCellValue(adr('B8')).cellValue).toBeCloseTo(0.0000000000001, 5)
  })

  it('plus', () => {
    const chunk1 = '.0000000001'
    const chunk2 = '.0000000000001'
    const formulas = [
      ['=1+-1' + chunk1, '=1+-1' + chunk2],
      ['=1' + chunk1 + '+-1', '=1' + chunk2 + '+-1'],
      ['=-1' + chunk1 + '+1', '=-1' + chunk2 + '+1'],
      ['=-1+1' + chunk1, '=-1+1' + chunk2],
      ['=0+-0' + chunk1, '=0+-0' + chunk2],
      ['=0' + chunk1 + '+-0', '=0' + chunk2 + '+-0'],
      ['=-0' + chunk1 + '+-0', '=-0' + chunk2 + '+-0'],
      ['=0+0' + chunk1, '=0+0' + chunk2],
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    const [engine] = HyperFormula.buildFromArray({ cells: formulas }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B5')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B6')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B7')).cellValue).toBeCloseTo(0.0000000000001, 5)
    expect(engine.getCellValue(adr('A8')).cellValue).toBeCloseTo(0.0000000001, 5)
    expect(engine.getCellValue(adr('B8')).cellValue).toBeCloseTo(0.0000000000001, 5)
  })
})

describe('Value-fixed', () => {
  it('should correctly calculate 0.2 + 0.1 as 0.3', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=0.2+0.1' }],
    ] }, {smartRounding: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(0.3)
  })
})

describe('tests', () => {
  it('addition of small numbers with smartRounding #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '0.000123456789' }, { cellValue: '1' }, { cellValue: '=A1+B1' }],
    ] }, {smartRounding: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1.000123456789)
  })

  it('addition of small numbers with smartRounding #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '0.000123456789' }, { cellValue: '1' }, { cellValue: '=A1+B1' }],
    ] }, {smartRounding: true, precisionRounding: 9})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1.000123457) //as GS and E
  })
})

describe('internal rounding', () => {
  it('Precision accumulates', () => {
    const formulas = [
      ['', 'Revenue', '', '1000', '=D1*(1+E2)', '=E1*(1+F2)', '=F1*(1+G2)', '=G1*(1+H2)', '=H1*(1+I2)', '=I1*(1+J2)', '=J1*(1+K2)', '=K1*(1+L2)', '=L1*(1+M2)', '=M1*(1+N2)'],
      ['', '% Growth', '', '', '.100000000000000', '=E2', '=F2', '=G2', '=H2', '=I2', '=J2', '=K2', '=L2', '=M2']
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray({ cells: formulas })

    const expectedFormulas = [
      ['', 'Revenue', '', 1000.000000000000000, 1100.000000000000000, 1210.000000000000000, 1331.000000000000000, 1464.100000000000000, 1610.510000000000000, 1771.561000000000000, 1948.717100000000000, 2143.588810000000000, 2357.947691000000000, 2593.742460100000000],
      ['', '% Growth', '', '', .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000, .100000000000000]
    ].map(x => x.map(z => ({
      cellValue: z
    })))
    expect(engine.getSheetValues(0).cells).toEqual(expectedFormulas)
  })
})

describe('number of leading digits', () => {
  it('rounding extensive test', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '0.33333333333333300000' }, { cellValue: '=A1/3' }],
      [{ cellValue: '10' }, { cellValue: '3.33333333333333000000' }, { cellValue: '=A2/3' }],
      [{ cellValue: '100' }, { cellValue: '33.33333333333330000000' }, { cellValue: '=A3/3' }],
      [{ cellValue: '1000' }, { cellValue: '333.33333333333300000000' }, { cellValue: '=A4/3' }],
      [{ cellValue: '10000' }, { cellValue: '3333.33333333333000000000' }, { cellValue: '=A5/3' }],
      [{ cellValue: '100000' }, { cellValue: '33333.33333333330000000000' }, { cellValue: '=A6/3' }],
      [{ cellValue: '1000000' }, { cellValue: '333333.33333333300000000000' }, { cellValue: '=A7/3' }],
      [{ cellValue: '10000000' }, { cellValue: '3333333.33333333000000000000' }, { cellValue: '=A8/3' }],
      [{ cellValue: '100000000' }, { cellValue: '33333333.33333330000000000000' }, { cellValue: '=A9/3' }],
      [{ cellValue: '1000000000' }, { cellValue: '333333333.33333300000000000000' }, { cellValue: '=A10/3' }],
      [{ cellValue: '10000000000' }, { cellValue: '3333333333.33333000000000000000' }, { cellValue: '=A11/3' }],
      [{ cellValue: '100000000000' }, { cellValue: '33333333333.33330000000000000000' }, { cellValue: '=A12/3' }],
      [{ cellValue: '1000000000000' }, { cellValue: '333333333333.33300000000000000000' }, { cellValue: '=A13/3' }],
      [{ cellValue: '10000000000000' }, { cellValue: '3333333333333.33000000000000000000' }, { cellValue: '=A14/3' }],
      [{ cellValue: '100000000000000' }, { cellValue: '33333333333333.30000000000000000000' }, { cellValue: '=A15/3' }],
      [{ cellValue: '1000000000000000' }, { cellValue: '333333333333333.00000000000000000000' }, { cellValue: '=A16/3' }],
      [{ cellValue: '10000000000000000' }, { cellValue: '3333333333333330.00000000000000000000' }, { cellValue: '=A17/3' }],
      [{ cellValue: '100000000000000000' }, { cellValue: '33333333333333300.00000000000000000000' }, { cellValue: '=A18/3' }],
      [{ cellValue: '1000000000000000000' }, { cellValue: '333333333333333000.00000000000000000000' }, { cellValue: '=A19/3' }],
      [{ cellValue: '10000000000000000000' }, { cellValue: '3333333333333330000.00000000000000000000' }, { cellValue: '=A20/3' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(engine.getCellValue(adr('B1')).cellValue)
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(engine.getCellValue(adr('B2')).cellValue)
    expect(engine.getCellValue(adr('C3')).cellValue).toEqual(engine.getCellValue(adr('B3')).cellValue)
    expect(engine.getCellValue(adr('C4')).cellValue).toEqual(engine.getCellValue(adr('B4')).cellValue)
    expect(engine.getCellValue(adr('C5')).cellValue).toEqual(engine.getCellValue(adr('B5')).cellValue)
    expect(engine.getCellValue(adr('C6')).cellValue).toEqual(engine.getCellValue(adr('B6')).cellValue)
    expect(engine.getCellValue(adr('C7')).cellValue).toEqual(engine.getCellValue(adr('B7')).cellValue)
    expect(engine.getCellValue(adr('C8')).cellValue).toEqual(engine.getCellValue(adr('B8')).cellValue)
    expect(engine.getCellValue(adr('C9')).cellValue).toEqual(engine.getCellValue(adr('B9')).cellValue)
    expect(engine.getCellValue(adr('C10')).cellValue).toEqual(engine.getCellValue(adr('B10')).cellValue)
    expect(engine.getCellValue(adr('C11')).cellValue).toEqual(engine.getCellValue(adr('B11')).cellValue)
    expect(engine.getCellValue(adr('C12')).cellValue).toEqual(engine.getCellValue(adr('B12')).cellValue)
    expect(engine.getCellValue(adr('C13')).cellValue).toEqual(engine.getCellValue(adr('B13')).cellValue)
    expect(engine.getCellValue(adr('C14')).cellValue).toEqual(engine.getCellValue(adr('B14')).cellValue)
    expect(engine.getCellValue(adr('C15')).cellValue).toEqual(engine.getCellValue(adr('B15')).cellValue)
    expect(engine.getCellValue(adr('C16')).cellValue).toEqual(engine.getCellValue(adr('B16')).cellValue)
    expect(engine.getCellValue(adr('C17')).cellValue).toEqual(engine.getCellValue(adr('B17')).cellValue)
    expect(engine.getCellValue(adr('C18')).cellValue).toEqual(engine.getCellValue(adr('B18')).cellValue)
    expect(engine.getCellValue(adr('C19')).cellValue).toEqual(engine.getCellValue(adr('B19')).cellValue)
    expect(engine.getCellValue(adr('C20')).cellValue).toEqual(engine.getCellValue(adr('B20')).cellValue)
  })
})
