import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function FILTER', () => {
  it('validates input #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(D2:E3, D2:E3)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongDimension))
  })

  it('validates input #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(D2:D3, D2:D3, D2:D4)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EqualLength))
  })

  it('validates input #3', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(1, FALSE())' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EmptyRange))
  })

  it('works #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(A2:C2,A3:C3)' }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('works #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(A2:C2,A3:C3,A4:C4)' }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('works #3', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(B1:B3,C1:C3)' }, { cellValue: 1 }, { cellValue: true }], [{ cellValue: '=FILTER(B1:B3,C1:C3)' }, { cellValue: 1 }, { cellValue: true }], [{ cellValue: '=FILTER(B1:B3,C1:C3)' }, { cellValue: 1 }, { cellValue: true }]])

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 1 }, { cellValue: true }], [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: true }], [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: true }]])
  })

  it('enables array arithmetic', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FILTER(2*A2:C2,A3:C3)' }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 4 }, { cellValue: 6 }], [{ cellValue: 2 }, { cellValue: 4 }, { cellValue: 6 }], [{ cellValue: 2 }, { cellValue: 4 }, { cellValue: 6 }]])
  })
})
