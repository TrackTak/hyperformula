import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IMPRODUCT', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPRODUCT()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should coerce explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPRODUCT(0)' }],
      [{ cellValue: '=IMPRODUCT("i", "-1.5")' }],
      [{ cellValue: '=IMPRODUCT("-3+4i", "1+i", 1, 2, "3")' }],
      [{ cellValue: '=IMPRODUCT("i",)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('-1.5i')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('-42+6i')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('i')
  })

  it('should fail for non-coercible explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPRODUCT(1, TRUE())' }],
      [{ cellValue: '=IMPRODUCT(2, "abcd")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should not coerce range arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IMPRODUCT(B1:C1)' }, { cellValue: 1 }, { cellValue: '2+i' }],
      [{ cellValue: '=IMPRODUCT(B2:D2)' }, { cellValue: 1 }, { cellValue: null }, { cellValue: null}],
      [{ cellValue: '=IMPRODUCT(B3:D3)' }, { cellValue: 'i' }, { cellValue: 'abcd' }, { cellValue: true}],
      [{ cellValue: '=IMPRODUCT(B4:D4,)' }, { cellValue: 'i' }, { cellValue: '=NA()' }, { cellValue: 1}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('2+i')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('i')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
