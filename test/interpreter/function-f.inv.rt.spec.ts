import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function F.INV.RT', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.INV.RT(1, 2)' }],
      [{ cellValue: '=F.INV.RT(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.INV.RT("foo", 2, 3)' }],
      [{ cellValue: '=F.INV.RT(1, "baz", 3)' }],
      [{ cellValue: '=F.INV.RT(1, 2, "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.INV.RT(0.1, 1, 1)' }],
      [{ cellValue: '=F.INV.RT(0.9, 2, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(39.8634581890474, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.111111111111111, 6)
  })

  it('truncates second and third arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.INV.RT(0.1, 1.9, 1)' }],
      [{ cellValue: '=F.INV.RT(0.9, 2, 2.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(39.8634581890474, 6)
    expect(engine.getCellValue(adr('A2')).cellValue).toBeCloseTo(0.111111111111111, 6)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=F.INV.RT(0.5, 0.999, 1)' }],
      [{ cellValue: '=F.INV.RT(0.5, 1, 0.999)' }],
      [{ cellValue: '=F.INV.RT(-0.0001, 2, 1)' }],
      [{ cellValue: '=F.INV.RT(1.0001, 2, 1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
