import {ErrorType, HyperFormula} from '../src'
import {ErrorMessage} from '../src/error-message'
import {adr, detailedError} from './testUtils'

describe('Wrong licence', () => {
  it('eval', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE()' }, { cellValue: null }, { cellValue: 1 }, { cellValue: '=A('}]] }, {licenseKey: ''})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.LIC, ErrorMessage.LicenseKey('missing')))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(null)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('serialization', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE()' }, { cellValue: null }, { cellValue: 1 }, { cellValue: '=A('}]] }, {licenseKey: ''})
    expect(engine.getSheetSerialized(0).cells).toEqual([[{ cellValue: '=TRUE()' }, { cellValue: null }, { cellValue: 1 }, { cellValue: '=A('}]])
  })
})
