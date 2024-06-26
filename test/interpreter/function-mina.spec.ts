import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('MINA', () => {
  it('MINA with empty args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MINA()' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('MINA with args', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=MINA(1, B1)' }, { cellValue: '3.14' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('MINA with range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }], [{ cellValue: '1' }], [{ cellValue: '1' }], [{ cellValue: '1' }]]})

    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('does only boolean coercions', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="42"' }, { cellValue: '=MINA(A1)' }],
      [{ cellValue: '=TRUE()' }, { cellValue: '=MINA(A2)' }],
      [{ cellValue: '=FALSE()' }, { cellValue: '=MINA(A3)' }],
      [{ cellValue: '="TRUE"' }, { cellValue: '=MINA(A4)' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual(0)
  })

  it('MINA of empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '' }, { cellValue: '=MINA(A1)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(0)
  })

  it('MINA of empty value and some positive number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '' }, { cellValue: '1' }, { cellValue: '=MINA(A1,B1)' }],
      [{ cellValue: null }, { cellValue: '1' }, { cellValue: '=MINA(A2,B2)' }],
    ]})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(1)
  })

  it('over a range value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '=MINA(MMULT(A1:B2, A1:B2))' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(7)
  })

  it('propagates errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '=4/0' }],
      [{ cellValue: '=FOOBAR()' }, { cellValue: '4' }],
      [{ cellValue: '=MINA(A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
