import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('AVERAGE', () => {
  it('AVERAGE with empty args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=AVERAGE()' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('AVERAGE with args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=AVERAGE(1, B1)' }, { cellValue: '4' }]
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(2.5)
  })

  it('AVERAGE with range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '4' }],
      [{ cellValue: '=AVERAGE(A1:A3)' }]
    ])

    expect(engine.getCellValue(adr('A4'))).toBeCloseTo(2.333333333)
  })

  it('AVERAGE ignores all nonnumeric arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '42' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: null }],
      [{ cellValue: '=TRUE()' }],
      [{ cellValue: '=AVERAGE(A1:A4)' }]
    ])

    expect(engine.getCellValue(adr('A5'))).toEqual(42)
  })

  it('error when no meaningful arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'foo' }],
      [{ cellValue: null }],
      [{ cellValue: '=AVERAGE(A1:A2)' }]
    ])

    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=AVERAGE(MMULT(A1:B2, A1:B2))' }],
    ])

    expect(engine.getCellValue(adr('A3'))).toEqual(13.5)
  })

  it('does propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=AVERAGE(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
