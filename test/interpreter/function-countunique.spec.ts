import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COUNTUNIQUE', () => {
  it('error when no arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTUNIQUE()' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('single number', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTUNIQUE(1)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('three numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTUNIQUE(2, 1, 2)' }],
      [{ cellValue: '=COUNTUNIQUE(2, 1, 1)' }],
      [{ cellValue: '=COUNTUNIQUE(2, 1, 3)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
  })

  it('theres no coercion', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '="1"' }],
      [{ cellValue: '=COUNTUNIQUE(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
  })

  it('errors in arguments are not propagated', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=COUNTUNIQUE(5/0)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('different errors are counted by type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=4/0' }, { cellValue: '=COUNTUNIQUE(A1:A4)' }],
      [{ cellValue: '=FOOBAR()' }],
      [{ cellValue: '=5/0' }],
      [{ cellValue: '=BARFOO()' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
  })

  it('empty string doesnt count', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=""' }, { cellValue: '=COUNTUNIQUE("", A1)' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('different strings are recognized are counted by type', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'foo' }, { cellValue: '=COUNTUNIQUE(A1:A4)' }],
      [{ cellValue: 'bar' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: 'bar ' }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
  })

  it('singular values are counted', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'TRUE()' }, { cellValue: '=COUNTUNIQUE(A1:A6)' }],
      [{ cellValue: 'FALSE()' }],
      [{ cellValue: null }],
      [{ cellValue: 'TRUE()' }],
      [{ cellValue: 'FALSE()' }],
      [{ cellValue: null }],
    ])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
  })
})
