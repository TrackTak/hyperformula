import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function T.INV.2T', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.INV.2T(1)' }],
      [{ cellValue: '=T.INV.2T(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.INV.2T("foo", 2)' }],
      [{ cellValue: '=T.INV.2T(0.5, "baz")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.INV.2T(0.1, 1)' }],
      [{ cellValue: '=T.INV.2T(0.9, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(6.31375151467394, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.142133810903748, 6)
  })

  it('should truncate input', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.INV.2T(0.1, 1.9)' }],
      [{ cellValue: '=T.INV.2T(0.9, 2.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(6.31375151467394, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.142133810903748, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=T.INV.2T(0.01, 1)' }],
      [{ cellValue: '=T.INV.2T(0, 1)' }],
      [{ cellValue: '=T.INV.2T(1, 1)' }],
      [{ cellValue: '=T.INV.2T(1.01, 1)' }],
      [{ cellValue: '=T.INV.2T(0.5, 0.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(63.656741162866, 6)
    //product #2 returns different error
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
    //product #2 returns value
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
