import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function VARPA', () => {
  it('should take at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VARPA()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate variance (population)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VARPA(2, 3)' }],
      [{ cellValue: '=VARPA(1)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0.25)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('should coerce explicit argument to numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VARPA(2, 3, 4, TRUE(), FALSE(), "1",)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1.95918367346939, 6)
  })

  it('should evaluate TRUE to 1, FALSE to 0 and text to 0', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VARPA(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue: true}, { cellValue: false}, { cellValue: 'a'}, { cellValue: '\'1'}, { cellValue: null}],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(2.24489795918367, 6)
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VARPA(B1:I1)'}, { cellValue: 2}, { cellValue: 3}, { cellValue: 4}, { cellValue:  '=NA()'}, { cellValue: false}, { cellValue:  'a'}, { cellValue:  '\'1' }, { cellValue:  null }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
