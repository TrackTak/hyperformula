import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PRODUCT', () => {
  it('should take at least one argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PRODUCT()' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate product', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PRODUCT(2, 3)' }],
      [{ cellValue: '=PRODUCT(B2:D2, E2, F2)' }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 'foo'}, {cellValue: 'bar' }, { cellValue: 4 }],
      [{ cellValue: '=PRODUCT(5, "foo")' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(6)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(24)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })
})
