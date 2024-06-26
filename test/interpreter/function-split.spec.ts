import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SPLIT', () => {
  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SPLIT(1)' }, { cellValue: '=SPLIT("a","b","c")' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })
  it('happy path', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'some words' }, { cellValue: '=SPLIT(A1, 0)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('some')
  })

  it('bigger index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'some words' }, { cellValue: '=SPLIT(A1, 1)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('words')
  })

  it('when continuous delimeters', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'some  words' }, { cellValue: '=SPLIT(A1, 1)' }, { cellValue: '=SPLIT(A1, 2)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('words')
  })

  it('coerce first argument to string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '42' }, { cellValue: '=SPLIT(A1, 1)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
  })

  it('when 2nd arg not a number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'some words' }, { cellValue: '=SPLIT(A1, "foo")' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('when index arg is not value within bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'some words' }, { cellValue: '=SPLIT(A1, 17)' }, { cellValue: '=SPLIT(A1, -1)' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.IndexBounds))
  })
})
