import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IMSUM', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUM()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should coerce explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUM(0)' }],
      [{ cellValue: '=IMSUM("i", "-1.5")' }],
      [{ cellValue: '=IMSUM("-3+4i", "1+i", 1, 2, "3")' }],
      [{ cellValue: '=IMSUM("i",)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual('0')
    expect(engine.getCellValue(adr('A2'))).toEqual('-1.5+i')
    expect(engine.getCellValue(adr('A3'))).toEqual('4+5i')
    expect(engine.getCellValue(adr('A4'))).toEqual('i')
  })

  it('should fail for non-coercible explicit arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUM(1, TRUE())' }],
      [{ cellValue: '=IMSUM(2, "abcd")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ComplexNumberExpected))
  })

  it('should not coerce range arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IMSUM(B1:C1)' }, { cellValue: 1 }, { cellValue: '2+i' }],
      [{ cellValue: '=IMSUM(B2:D2)' }, { cellValue: 1 }, { cellValue: null }, { cellValue: null}],
      [{ cellValue: '=IMSUM(B3:D3)' }, { cellValue: 'i' }, { cellValue: 'abcd' }, { cellValue: true}],
      [{ cellValue: '=IMSUM(B4:D4,)' }, { cellValue: 'i' }, { cellValue: '=NA()' }, { cellValue: 1}],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual('3+i')
    expect(engine.getCellValue(adr('A2'))).toEqual('1')
    expect(engine.getCellValue(adr('A3'))).toEqual('i')
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.NA))
  })
})
