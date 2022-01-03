import {HyperFormula} from '../src'

describe('Small tests that check evaluation order', () => {
  it('passes #1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 500 }, { cellValue: '=(1-B2)*A1' }, { cellValue: '=(1-B2)*B1' }],
      [{ cellValue:'=A1'}, { cellValue:0.2}, { cellValue:'=B2'}],
    ])
    expect(engine.getSheetValues(0)).toEqual([
      [{ cellValue: 500 }, { cellValue: 400 }, { cellValue: 320 }],
      [{ cellValue: 500 }, { cellValue: 0.2 }, { cellValue:0.2 }]
    ])
  })

  it('passes #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 500 }, { cellValue: '=(1-B2)*A2' }, { cellValue: '=(1-C2)*B1' }],
      [{ cellValue:'=A1'}, { cellValue:0.2}, { cellValue:'=B2'}],
    ])
    expect(engine.getSheetValues(0)).toEqual([
      [{ cellValue: 500 }, { cellValue: 400 }, { cellValue: 320 }],
      [{ cellValue: 500 }, { cellValue: 0.2 }, { cellValue: 0.2 }]
    ])
  })
})
