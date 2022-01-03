import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('string comparison', () => {
  it('comparison default', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'A' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'aa' }, { cellValue: 'AA' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'aA' }, { cellValue: 'aa' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'Aa' }, { cellValue: 'aa' }, { cellValue: '=A4>B4' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('accents default', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'ä' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'áá' }, { cellValue: 'ää' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'ää' }, { cellValue: 'ĄĄ' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'ää' }, { cellValue: 'ZZ' }, { cellValue: '=A4>B4' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('accents sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'Ą' }, { cellValue: 'ą' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'ää' }, { cellValue: 'áá' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'ää' }, { cellValue: 'ĄĄ' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'ää' }, { cellValue: 'ŹŹ' }, { cellValue: '=A4>B4' }],
    ], {accentSensitive: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('accents+case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'Ą' }, { cellValue: 'ą' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'áá' }, { cellValue: 'ää' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'ää' }, { cellValue: 'ĄĄ' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'ää' }, { cellValue: 'ŹŹ' }, { cellValue: '=A4>B4' }],
    ], {accentSensitive: true, caseSensitive: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('accents+case sensitive, reverse order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'Ą' }, { cellValue: 'ą' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'áá' }, { cellValue: 'ää' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'ää' }, { cellValue: 'ĄĄ' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'ää' }, { cellValue: 'ŹŹ' }, { cellValue: '=A4>B4' }],
    ], {accentSensitive: true, caseSensitive: true, caseFirst: 'upper'})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('accents lang', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'ä' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'aa' }, { cellValue: 'ää' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'ää' }, { cellValue: 'ĄĄ' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'ää' }, { cellValue: 'ZZ' }, { cellValue: '=A4>B4' }],
    ], {localeLang: 'sv', accentSensitive: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(true)
  })

  it('comparison case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'ą' }, { cellValue: 'A' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'aa' }, { cellValue: 'AA' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'aA' }, { cellValue: 'aa' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'Aa' }, { cellValue: 'aa' }, { cellValue: '=A4>B4' }],
    ], {caseSensitive: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(true)
  })

  it('comparison case sensitive, reverse order', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'ą' }, { cellValue: 'A' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'aa' }, { cellValue: 'AA' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'aA' }, { cellValue: 'aa' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'Aa' }, { cellValue: 'aa' }, { cellValue: '=A4>B4' }],
    ], {caseSensitive: true, caseFirst: 'upper'})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })

  it('comparison ignore punctuation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'A,A,A' }, { cellValue: '=A1>B1' }],
      [{ cellValue: 'aa' }, { cellValue: '...AA' }, { cellValue: '=A2>B2' }],
      [{ cellValue: 'aA' }, { cellValue: ';;;;aa' }, { cellValue: '=A3>B3' }],
      [{ cellValue: 'Aa' }, { cellValue: '????aa' }, { cellValue: '=A4>B4' }],
    ], {ignorePunctuation: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C2')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C3')).cellValue).toBe(false)
    expect(engine.getCellValue(adr('C4')).cellValue).toBe(false)
  })
})
