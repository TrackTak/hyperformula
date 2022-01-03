import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {adr, detailedError} from '../testUtils'

describe('EmptyValue tests', () => {
  it('EmptyValue vs EmptyValue tests', () => {
    const formulas = [
      [null, null, '=A1=B1', '=A1>B1', '=A1<B1', '=A1>=B1', '=A1<=B1', '=A1<>B1', '=A1+B1', '=A1-B1', '=A1*B1', '=A1/B1', '=A1^B1', '=A1&B1', '=+A1', '=-A1', '=A1%']
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray(formulas)

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)  // EQUAL
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(false) // GT
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(false) // LT
    expect(engine.getCellValue(adr('F1')).cellValue).toEqual(true) // GTE
    expect(engine.getCellValue(adr('G1')).cellValue).toEqual(true) // LTE
    expect(engine.getCellValue(adr('H1')).cellValue).toEqual(false) // NOT EQUAL
    expect(engine.getCellValue(adr('I1')).cellValue).toEqual(0) // ADD
    expect(engine.getCellValue(adr('J1')).cellValue).toEqual(0) // SUB
    expect(engine.getCellValue(adr('K1')).cellValue).toEqual(0) // MULT
    expect(engine.getCellValue(adr('L1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO)) // DIV
    expect(engine.getCellValue(adr('M1')).cellValue).toEqual(1) // EXP
    expect(engine.getCellValue(adr('N1')).cellValue).toEqual('') // CONCAT
    expect(engine.getCellValue(adr('O1')).cellValue).toBe(null) // UNARY PLUS
    expect(engine.getCellValue(adr('P1')).cellValue).toEqual(0) // UNARY MINUS
    expect(engine.getCellValue(adr('Q1')).cellValue).toEqual(0) // PERCENTAGE
  })

  it('Boolean vs EmptyValue tests', () => {
    const formulas = [
      ['=TRUE()', null, '=A1=B1', '=A1>B1', '=A1<B1', '=A1>=B1', '=A1<=B1', '=A1<>B1', '=A1+B1', '=A1-B1', '=A1*B1', '=A1/B1', '=A1^B1', '=A1&B1', '=+A1', '=-A1', '=A1%']
    ].map(x => x.map(z => ({
      cellValue: z
    })))

    const [engine] = HyperFormula.buildFromArray(formulas)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(false) // EQUAL
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(true) // GT
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(false) // LT
    expect(engine.getCellValue(adr('F1')).cellValue).toEqual(true) // GTE
    expect(engine.getCellValue(adr('G1')).cellValue).toEqual(false) // LTE
    expect(engine.getCellValue(adr('H1')).cellValue).toEqual(true) // NOT EQUAL
    expect(engine.getCellValue(adr('I1')).cellValue).toEqual(1) // ADD
    expect(engine.getCellValue(adr('J1')).cellValue).toEqual(1) // SUB
    expect(engine.getCellValue(adr('K1')).cellValue).toEqual(0) // MULT
    expect(engine.getCellValue(adr('L1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO)) // DIV
    expect(engine.getCellValue(adr('M1')).cellValue).toEqual(1) // EXP
    expect(engine.getCellValue(adr('N1')).cellValue).toEqual('TRUE') // CONCAT
    expect(engine.getCellValue(adr('O1')).cellValue).toEqual(true) // UNARY PLUS
    expect(engine.getCellValue(adr('P1')).cellValue).toEqual(-1) // UNARY MINUS
    expect(engine.getCellValue(adr('Q1')).cellValue).toEqual(0.01) // PERCENTAGE
  })
})
