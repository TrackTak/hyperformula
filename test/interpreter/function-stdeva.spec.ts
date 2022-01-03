import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function STDEVA', () => {
  it('should take at least two arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=STDEVA()' }],
      [{ cellValue: '=STDEVA(1)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should calculate standard deviation (sample)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=STDEVA(2, 3)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.707106781186548)
  })

  it('should coerce explicit argument to numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=STDEVA(2, 3, 4, TRUE(), FALSE(), "1",)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.51185789203691)
  })

  it('should evaluate TRUE to 1, FALSE to 0 and text to 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=STDEVA(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue: true}, { cellValue: false}, { cellValue: 'a'}, { cellValue: '\'1'}, { cellValue: null}],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.61834718742537)
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=STDEVA(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue:  '=NA()'}, { cellValue: false}, { cellValue:  'a'}, { cellValue:  '\'1' }, { cellValue:  null }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
