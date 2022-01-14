import {ErrorType, HyperFormula} from '../../src'
import {CellValueDetailedType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FVSCHEDULE', () => {
  it('should return #NA! error with the wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FVSCHEDULE(1)' }, { cellValue: '=FVSCHEDULE(1, 1, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should calculate the correct value with correct arguments and defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FVSCHEDULE(1, 1)' }],
      [{ cellValue: '=FVSCHEDULE(2, B2:D2)' }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: null}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(8)
  })

  it('should return proper error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=FVSCHEDULE(2, B1:C1)' }, { cellValue: '\'1' }, { cellValue: true }],
      [{ cellValue: '=FVSCHEDULE(1, B2:C2)' }, { cellValue: 'abcd' }, { cellValue: '=NA()' }],
      [{ cellValue: '=FVSCHEDULE(1, B3)' }, { cellValue: 'abcd' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberExpected))
  })
})
