import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('SUM', () => {
  it('SUM without args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SUM()' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('SUM with args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SUM(1, B1)' }, { cellValue: '3.14' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(4.14)
  })

  it('SUM with range args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=SUM(A1:B2)' }]
    ])
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(10)
  })

  it('SUM with column range args', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '5' }],
      [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=SUM(A:B)' }]
    ])
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(10)
  })

  it('SUM with using previously cached value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '3' }, { cellValue: '=SUM(A1:A1)' }],
      [{ cellValue: '4' }, { cellValue: '=SUM(A1:A2)' }],
    ])
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(7)
  })

  it('doesnt do coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: 'foo' }],
      [{ cellValue: '=TRUE()' }],
      [{ cellValue: '=CONCATENATE("1","0")' }],
      [{ cellValue: '=SUM(A1:A5)' }],
      [{ cellValue: '=SUM(A3)' }],
      [{ cellValue: '=SUM(A4)' }],
      [{ cellValue: '=SUM(A5)' }],
    ])

    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual(0)
  })

  it('works when precision (default setting)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1.00000000000005' }, { cellValue: '-1' }],
      [{ cellValue: '=SUM(A1:B1)' }]
    ])

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('explicitly called does coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUM(2,TRUE())' }],
      [{ cellValue: '=SUM(2,"foo",TRUE())' }],
      [{ cellValue: '=SUM(TRUE())' }],
      [{ cellValue: '=SUM("10")' }]
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(10)
  })

  it('doesnt take value from range if it does not store cached value for that function', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '=MAX(A1:A2)' }],
      [{ cellValue: '=SUM(A1:A3)' }],
    ])
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(5)
  })

  it('range only with empty value', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '' }, { cellValue: '=SUM(A1:A1)' }]])
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('range only with some empty values', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '42' }, { cellValue: '' }, { cellValue: '13' }, { cellValue: '=SUM(A1:C1)'}]])
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(55)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=SUM(MMULT(A1:B2, A1:B2))' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(54)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=SUM(A1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
