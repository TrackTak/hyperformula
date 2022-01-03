import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('COUNTBLANK', () => {
  it('with empty args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTBLANK()' }],
      [{ cellValue: '=COUNTBLANK(,)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
  })

  it('with args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=COUNTBLANK(B1, C1)' }, { cellValue: '3.14' }]])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('with range', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '1' }, { cellValue: null }, { cellValue: null }, { cellValue: '=COUNTBLANK(A1:C1)'}]])
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(2)
  })

  it('with empty strings', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '' }, { cellValue: null }, { cellValue: null }, { cellValue: '=COUNTBLANK(A1:C1)'}]])
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(2)
  })

  it('does not propagate errors from ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }],
      [{ cellValue: '=4/0' }],
      [{ cellValue: '=COUNTBLANK(A1:A2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('does not propagate errors from arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTBLANK(4/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('works even when range vertex is in cycle', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '=COUNTBLANK(A1:A3)' }],
      [{ cellValue: null }],
      [{ cellValue: '=COUNTBLANK(A1:A3)' }]
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })
})
