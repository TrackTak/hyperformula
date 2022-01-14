import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - SWITCH function', () => {
  it('Should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(1)' }, { cellValue: '=SWITCH(2,3)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('Should work with more arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(1,2,3)' }, { cellValue: '=SWITCH(1,2,3,4)' }, { cellValue: '=SWITCH(1,2,3,4,5)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.NoDefault))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.NoDefault))
  })

  it('Should work with precision', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '1.0000000001' }, { cellValue: '3' }, { cellValue: '1.0000000000001'}, {cellValue: '5' }],
      [{ cellValue: '=SWITCH(A1,B1,C1,D1,E1)' }]
    ]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(5)
  })

  it('Should work with strings', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 'abc' }, { cellValue: '1' }, { cellValue: '3' }, { cellValue: 'ABC'}, {cellValue: '5' }],
      [{ cellValue: '=SWITCH(A1,B1,C1,D1,E1)' }]
    ] }, {caseSensitive: false})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(5)
  })
  it('Should fail with error in first argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(1/0,1/0,3,4,5)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Should not fail with error in other arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(4,1/0,3,4,5)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
  })
  it('Should pass errors as normal values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(4,2,3,4,1/0)' }, { cellValue: '=SWITCH(1,2,3,4,1/0,5)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(5)
  })
  it('Should fail with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH(1,2,A2:A3,4,5)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })
  it('passes subtypes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SWITCH(1,1,B1)' }, { cellValue: '1%' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })
})
