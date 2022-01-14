import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function TRIM', () => {
  it('should return N/A when number of arguments is incorrect', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRIM()' }],
      [{ cellValue: '=TRIM("foo", "bar")' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRIM("   foo")' }],
      [{ cellValue: '=TRIM("foo   ")' }],
      [{ cellValue: '=TRIM(" foo   ")' }],
      [{ cellValue: '=TRIM(" f    o  o   ")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('f o o')
  })

  it('should coerce other types to string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRIM(1)' }],
      [{ cellValue: '=TRIM(5+5)' }],
      [{ cellValue: '=TRIM(TRUE())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('10')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('TRUE')
  })
})
