import {ErrorType, HyperFormula} from '../src'
import {detailedErrorWithOrigin} from './testUtils'

describe('should properly build', () => {
  it('for this test', () => {
    const [engine] = HyperFormula.buildEmpty()
    engine.addSheet()
    engine.setSheetContent(0, [
      [{ cellValue: '=MAX(B1:B2)' }, { cellValue: '=MAX(A1:A2)' }],
      [{ cellValue: '=MAX(B1:B2)' }, { cellValue: '=MAX(A1:A2)' }],
    ])
    expect(engine.getSheetValues(0)).toEqual(
      [
        [{ cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1')}, { cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1') }],
        [{ cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A2')}, { cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B2') }],
      ]
    )
  })

  it('and for this', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MAX(B1:B2)' }, { cellValue: '=MAX(A1:A2)' }],
      [{ cellValue: '=MAX(B1:B2)' }, { cellValue: '=MAX(A1:A2)' }],
    ])
    expect(engine.getSheetValues(0)).toEqual(
      [
        [{ cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A1')}, { cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B1') }],
        [{ cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!A2')}, { cellValue: detailedErrorWithOrigin(ErrorType.CYCLE, 'Sheet1!B2') }],
      ]
    )
  })
})
