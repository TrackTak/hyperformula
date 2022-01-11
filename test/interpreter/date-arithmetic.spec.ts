import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('Date arithmetic', () => {
  it('subtract two dates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '02/02/2020' }, { cellValue: '06/02/2019' }, { cellValue: '=A1-B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(361)
  })
  it('compare two dates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '02/02/2020' }, { cellValue: '02/06/2019' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(false)
  })
  it('compare two datestrings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="02/02/2020"' }, { cellValue: '="02/06/2019"' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(false)
  })

  it('compare date with datestring, different dates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="02/02/2020"' }, { cellValue: '02/06/2019' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }, { cellValue: '=A1=B1' }, { cellValue: '=A1<>B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('G1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('H1')).cellValue).toBe(true)
  })

  it('compare date with datestring, the same dates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="02/02/2020"' }, { cellValue: '02/02/2020' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }, { cellValue: '=A1=B1' }, { cellValue: '=A1<>B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('G1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('H1')).cellValue).toBe(false)
  })
  it('compare date with bool', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="02/02/2020"' }, { cellValue: '=TRUE()' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(true)
  })
  it('compare date with number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '02/02/2020' }, { cellValue: '2' }, { cellValue: '=A1>B1' }, { cellValue: '=A1<B1'}, {cellValue: '=A1>=B1' }, { cellValue: '=A1<=B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toBe(false)
  })
  it('sum date with number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '02/02/2020' }, { cellValue: '2' }, { cellValue: '=A1+B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(43865)
  })
  it('sum date with boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '02/02/2020' }, { cellValue: '=TRUE()' }, { cellValue: '=A1+B1' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(43864)
  })
  it('functions on dates', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ISEVEN("02/02/2020")' }, { cellValue: '=COS("02/02/2020")' }, { cellValue: '=BITOR("02/02/2020","16/08/1985")' }],
    ] }, {smartRounding: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(0.9965266857693633)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(64383)
  })
})
