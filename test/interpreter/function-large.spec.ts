import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function LARGE', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(1)' }],
      [{ cellValue: '=LARGE(1, 2, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(1, "baz")' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(A2:D2,0)' }, { cellValue: '=LARGE(A2:D2,1)' }, { cellValue: '=LARGE(A2:D2,2)' }, { cellValue: '=LARGE(A2:D2,3)'}, {cellValue: '=LARGE(A2:D2,4)' }, { cellValue: '=LARGE(A2:D2,5)' }],
      [{ cellValue: 1 }, { cellValue: 4 }, { cellValue: 2 }, { cellValue: 4}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('F1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('should ignore non-numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(A2:D2,0)' }, { cellValue: '=LARGE(A2:D2,1)' }, { cellValue: '=LARGE(A2:D2,2)' }, { cellValue: '=LARGE(A2:D2,3)'}],
      [{ cellValue: 1 }, { cellValue: 4 }, { cellValue: true }, { cellValue: 'abcd'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(A2:D2,0)' }, { cellValue: '=LARGE(A2:D2,1)' }, { cellValue: '=LARGE(A2:D2,2)' }, { cellValue: '=LARGE(A2:D2,3)'}],
      [{ cellValue: 1 }, { cellValue: 4 }, { cellValue: '=NA()' }, { cellValue: 'abcd'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NA))
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  it('should truncate second arg', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(A2:D2,0.9)' }, { cellValue: '=LARGE(A2:D2,1.9)' }, { cellValue: '=LARGE(A2:D2,2.9)' }, { cellValue: '=LARGE(A2:D2,3.9)'}, {cellValue: '=LARGE(A2:D2,4.9)' }, { cellValue: '=LARGE(A2:D2,5.9)' }],
      [{ cellValue: 1 }, { cellValue: 4 }, { cellValue: 2 }, { cellValue: 4}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('F1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('should work for non-ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=LARGE(1,0)' }, { cellValue: '=LARGE(1,1)' }, { cellValue: '=LARGE(1,2)' }, { cellValue: '=LARGE(TRUE(),1)'}],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    //inconsistency with product #2
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })
})
