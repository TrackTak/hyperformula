import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function PROPER', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PROPER()' }],
      [{ cellValue: '=PROPER("foo", "bar")' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PROPER("foo")' }],
      [{ cellValue: '=PROPER("foo bar")' }],
      [{ cellValue: '=PROPER(" foo    bar   ")' }],
      [{ cellValue: '=PROPER("fOo BAR")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('Foo')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('Foo Bar')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(' Foo    Bar   ')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('Foo Bar')
  })

  it('should work with punctuation marks and numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PROPER("123aa123bb.cc.dd")' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('123Aa123Bb.Cc.Dd')
  })

  it('should work with accents', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PROPER("MAI ANH ĐỨC")' }],
      [{ cellValue: '=PROPER("MAI CHÍ THỌ")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('Mai Anh Đức')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('Mai Chí Thọ')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=PROPER(1)' }],
      [{ cellValue: '=PROPER(5+5)' }],
      [{ cellValue: '=PROPER(TRUE())' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('10')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('True')
  })
})
