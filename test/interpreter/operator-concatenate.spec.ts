import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - concatenate operator', () => {
  it('Ampersand with string arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="foo"&"bar"' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('foobar')
  })

  it('Ampersand with cell address', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 'foo' }, { cellValue: '=A1&"bar"' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBe('foobar')
  })

  it('Ampersand with number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=1&2' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('12')
  })

  it('Ampersand with bool', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="foo"&TRUE()' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('fooTRUE')
  })

  it('Ampersand with null', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="foo"&B1' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('foo')
  })

  it('Ampersand with error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=1/0' }, { cellValue: '=A1&TRUE()' }],
    ]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
