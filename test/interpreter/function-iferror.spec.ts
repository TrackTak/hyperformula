import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IFERROR', () => {
  it('Should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=IFERROR(1)' }, { cellValue: '=IFERROR(2,3,4)' }]
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
  it('when no error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR("abcd", "no")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('abcd')
  })

  it('preserves types of first arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(B1, 1)' }, { cellValue: '1%' }]]})

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('preserves types of second arg', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(NA(), B1)' }, { cellValue: '1%' }]]})

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('when left-error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(1/0, "yes")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('yes')
  })

  it('when right-error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR("yes", 1/0)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('yes')
  })

  it('when both-error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(#VALUE!, 1/0)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('when range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR("yes", A2:A3)' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('when cycle', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(B1, 1)' }, { cellValue: '=B1' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('when left-parsing error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IFERROR(B1, 1/0)' }, { cellValue: '=SUM(' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
