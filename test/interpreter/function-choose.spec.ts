import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - CHOOSE function', () => {
  it('Should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(0)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('Should work with more arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(1,2,3)' }, { cellValue: '=CHOOSE(3,2,3,4)' }, { cellValue: '=CHOOSE(2,2,3,4,5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(3)
  })

  it('should preserve types', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=CHOOSE(1,B1,3)' }, { cellValue: '1%' }]])

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('preserves types of second arg', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFERROR(NA(), B1)' }, { cellValue: '1%' }]])

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('Should fail when wrong first argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(1.5,2,3)' }, { cellValue: '=CHOOSE(0,2,3,4)' }, { cellValue: '=CHOOSE(5,2,3,4,5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.IntegerExpected))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.Selector))
  })

  it('Coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(TRUE(),2,3)' }, { cellValue: '=CHOOSE("31/12/1899",2,3,4)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
  })

  it('Should fail with error in first argument', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(1/0,3,4,5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Should not fail with error in other arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(4,1/0,3,4,5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
  })
  it('Should pass errors as normal values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(4,2,3,4,1/0)' }, { cellValue: '=CHOOSE(1,2,3,4,COS(1,1),5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
  })
  it('Should fail with range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=CHOOSE(1,2,A2:A3,4,5)' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
})
