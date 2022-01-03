import {HyperFormula} from '../src'
import {ErrorType} from '../src/Cell'
import {ErrorMessage} from '../src/error-message'
import AsyncTestPlugin, { getLoadingError } from './helpers/AsyncTestPlugin'
import {adr, detailedError} from './testUtils'

describe('Interpreter', () => {
  it('relative addressing formula', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '42' }, { cellValue: '=A1' }]])

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(42)
  })

  it('number literal', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '3' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3)
  })

  it('negative number literal', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=-3' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(-3)
  })

  it('negative number literal - non numeric value', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=-"foo"' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('string literals - faulty tests', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'www' }, { cellValue: '1www' }, { cellValue: 'www1' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('www')
    expect(engine.getCellValue(adr('B1')).cellValue).toBe('1www')
    expect(engine.getCellValue(adr('C1')).cellValue).toBe('www1')
  })

  it('string literals in formula - faulty tests', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="www"' }, { cellValue: '="1www"' }, { cellValue: '="www1"' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toBe('www')
    expect(engine.getCellValue(adr('B1')).cellValue).toBe('1www')
    expect(engine.getCellValue(adr('C1')).cellValue).toBe('www1')
  })

  it('ranges - VALUE error when evaluating without context', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '1' }], [{ cellValue: '1' }], [{ cellValue: '1' }]])
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('procedures - SUM with bad args', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SUM(B1)' }, { cellValue: 'asdf' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('procedures - not known procedure', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=FOO()' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOO')))
  })

  it('async procedures - loading', () => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ASYNC_FOO()' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(getLoadingError('Sheet1!A1'))
  })

  it('errors - parsing errors', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=A1C1' }, { cellValue: '=foo(' }, { cellValue: '=)(asdf' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('function OFFSET basic use', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '5' }, { cellValue: '=OFFSET(B1, 0, -1)' }, { cellValue: '=OFFSET(A1, 0, 0)' }]])

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(5)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(5)
  })

  it('function OFFSET out of range', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=OFFSET(A1, -1, 0)' }, { cellValue: '=OFFSET(A1, 0, -1)' }]])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.OutOfSheet))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.OutOfSheet))
  })

  it('function OFFSET returns bigger range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUM(OFFSET(A1, 0, 1,2,1))' }, { cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '2' }, { cellValue: '3' }, { cellValue: '4' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(8)
  })

  it('function OFFSET returns rectangular range and fails', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=OFFSET(A1, 0, 1,2,1))' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('function OFFSET used twice in a range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '5' }, { cellValue: '6' }, { cellValue: '=SUM(OFFSET(A2,-1,0):OFFSET(A2,0,1))' }],
      [{ cellValue: '2' }, { cellValue: '3' }, { cellValue: '4' }],
    ])

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(16)
  })

  it('function OFFSET as a reference inside SUM', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '0' }, { cellValue: '10' }],
      [{ cellValue: '5' }, { cellValue: '6' }, { cellValue: '=SUM(SUM(OFFSET(C2,-1,0),A2),-B2)' }],
    ])

    expect(engine.getCellValue(adr('C2')).cellValue).toEqual(9)
  })

  it('initializing engine with multiple sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '0' }, { cellValue: '1' }],
        [{ cellValue: '2' }, { cellValue: '3' }],
      ],
      Sheet2: [
        [{ cellValue: '=SUM(Sheet1!A1:Sheet1!B2)' }],
      ],
    })
    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqual(6)
  })

  it('using bad range reference', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '0' }, { cellValue: '1' }],
        [{ cellValue: '2' }, { cellValue: '3' }],
      ],
      Sheet2: [
        [{ cellValue: '=SUM(Sheet1!A1:Sheet2!A2)' }],
        [{ cellValue: '' }],
      ],
    })
    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
  })

  it('expression with parenthesis', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=(1+2)*3' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(9)
  })

  it('should return #REF when range is pointing to multiple sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': [
        [{ cellValue: '=SUM(Sheet1!A2:Sheet2!B3)' }],
        [{ cellValue: '=SUM(Sheet1!A:Sheet2!B)' }],
        [{ cellValue: '=SUM(Sheet1!2:Sheet2!3)' }],
        [{ cellValue: '=Sheet1!A2:Sheet2!B3' }],
        [{ cellValue: '=Sheet1!A:Sheet2!B' }],
        [{ cellValue: '=Sheet1!2:Sheet2!3' }],
      ],
      'Sheet2': []
    })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
    expect(engine.getCellValue(adr('A6')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.RangeManySheets))
  })
})
