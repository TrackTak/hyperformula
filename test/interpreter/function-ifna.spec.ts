import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function IFNA', () => {
  it('Should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=IFNA(1)' }, { cellValue: '=IFNA(2,3,4)' }]
    ])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
  it('when no error', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA("abcd", "no")' }]])

    expect(engine.getCellValue(adr('A1'))).toEqual('abcd')
  })

  it('when left-error NA', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(COS(1,1), "yes")' }]])

    expect(engine.getCellValue(adr('A1'))).toEqual('yes')
  })

  it('when left-error DIV0', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(1/0, "yes")' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('when right-error', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA("yes", 1/0)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqual('yes')
  })

  it('when both-error', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(COS(1,1), 1/0)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('when both-error 2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(1/0, COS(1,1))' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('when range', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA("yes", A2:A3)' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('when cycle', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(B1, 1)' }, { cellValue: '=B1' }]])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.CYCLE))
  })

  it('when cycle 2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(1, B1)' }, { cellValue: '=B1' }]])

    expect(engine.getCellValue(adr('A1'))).toEqual(1)
  })

  it('preserves types of first arg', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(B1, 1)' }, { cellValue: '1%' }]])

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('preserves types of second arg', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IFNA(NA(), B1)' }, { cellValue: '1%' }]])

    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })
})
