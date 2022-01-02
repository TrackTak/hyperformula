import {ErrorType, HyperFormula} from '../src'
import {ArraySize} from '../src/ArraySize'
import {ArrayVertex, ValueCellVertex} from '../src/DependencyGraph'
import {ErrorMessage} from '../src/error-message'
import AsyncTestPlugin from './helpers/AsyncTestPlugin'
import {adr, detailedError, detailedErrorWithOrigin, expectVerticesOfTypes, noSpace} from './testUtils'

describe('without arrayformula, with useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=ASYNC_FOO(A1)' }], [{ cellValue: '=SUM(-A1:C1)' }]], {useArrayArithmetic: true})
    
    await promise

    expect(engine.getCellValue(adr('A2'))).toEqual(-9)
  })

  it('unary op, scalar ret', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(-A1:C1)' }]], {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A2'))).toEqual(-6)
  })

  it('unary op, array ret', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=-A1:C1' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [-1, -2, -3]])
  })

  it('binary op, scalar ret', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(2*A1:C1+A2:C2)' }]], {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A3'))).toEqual(27)
  })

  it('binary op, array ret', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=2*A1:C1+A2:C2' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }]])
  })

  it('binary op, array ret, concat', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: '=A1:C1&A2:C2' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }]])
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=INDEX(2*A1:C1+3,1,1)' }]], {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A2'))).toEqual(5)
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,1,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,2,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,3,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,3)' }],
    ], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [2, 4, detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C4')],
        [8, 10, detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C5')],
        [detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A6'), detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!B6'), detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C6')]])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MATCH(10,2*A2:E2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
    ], {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A1'))).toEqual(5)
  })
})

describe('without arrayformula, without useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(-A1:C1)'}]], {useArrayArithmetic: false})
    
    await promise

    expect(engine.getCellValue(adr('D2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('unary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(-A1:C1)'}]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('binary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(2*A1:C1+A2:C2)'}]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=INDEX(2*A1:C1+3,1,1)'}]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,1,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,2,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,3,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,3)' }],
    ], {useArrayArithmetic: false})
    expect(engine.getSheetValues(0)).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A4', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B4', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C4', ErrorMessage.ScalarExpected)],
        [detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A5', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B5', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C5', ErrorMessage.ScalarExpected)],
        [detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A6', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B6', ErrorMessage.ScalarExpected), detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C6', ErrorMessage.ScalarExpected)]
      ])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MATCH(10,2*B1:F1)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 5 }],
    ], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })
})

describe('with arrayformula, without useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=ASYNC_FOO(A1)' }], [{ cellValue: '=ARRAYFORMULA(SUM(-A1:C1))' }]], {useArrayArithmetic: false})
    
    await promise
    
    expect(engine.getCellValue(adr('A2'))).toEqual(-9)
  })

  it('unary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(SUM(-A1:C1))' }]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2'))).toEqual(-6)
  })

  it('unary op #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(ARRAYFORMULA(-A1:C1))' }]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2'))).toEqual(-6)
  })

  it('binary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(SUM(2*A1:C1+A2:C2))' }]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A3'))).toEqual(27)
  })

  it('binary op #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(ARRAYFORMULA(2*A1:C1+A2:C2))' }]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A3'))).toEqual(27)
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(INDEX(2*A1:C1+3,1,1))' }]], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2'))).toEqual(5)
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,3))' }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,3))' }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,3))' }],
    ], {useArrayArithmetic: false})
    expect(engine.getSheetValues(0)).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [2, 4, detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C4')],
        [8, 10, detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C5')],
        [detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A6'), detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!B6'), detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C6')]])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=ARRAYFORMULA(MATCH(10,2*A2:E2))' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
    ], {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A1'))).toEqual(5)
  })
})

describe('coercion of array to scalar', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(2*A1:C1)+ARRAYFORMULA(2*A1:C1)' }]])
    
    await promise

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }]])
  })

  it('actual range', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=SIN(A1:C1)'}]])
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('ad-hoc array + function #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SIN(ARRAYFORMULA(2*A1:C1))' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
  })

  it('ad-hoc array + function #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SIN({0,2,3})' }]])
    expect(engine.getCellValue(adr('A1'))).toEqual(0)
  })

  it('ad-hoc array + binary op #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(2*A1:C1)+ARRAYFORMULA(2*A1:C1)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }]])
  })

  it('ad-hoc array + binary op #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '={1,2,3}+{1,2,3}' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }]])
  })

  it('ad-hoc array + unary op #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=-ARRAYFORMULA(2*A1:C1)' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [-2]])
  })

  it('ad-hoc array + unary op #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=-{1,2,3}' }]])
    expect(engine.getSheetValues(0)).toEqual([[-1]])
  })
})

describe('range interpolation', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }], [{ cellValue: '=EXP(A1:C1)' }]])
    
    await promise

    expect(engine.getCellValue(adr('A2'))).toEqual(1)
  })

  it('with function', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: '=EXP(A1:C1)' }]])
    expect(engine.getCellValue(adr('A2'))).toEqual(1)
  })

  it('with binary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=A1:C1+A1:C1' }]])
    expect(engine.getCellValue(adr('B2'))).toEqual(2)
  })

  it('with unary op', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=-A1:C1' }]])
    expect(engine.getCellValue(adr('B2'))).toEqual(-1)
  })

  it('columns', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }], [{ cellValue: 1 }, { cellValue: '=-A1:A3' }], [{ cellValue: 0 }]])
    expect(engine.getCellValue(adr('B2'))).toEqual(-1)
  })

  it('too many rows', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=-A1:C2' }]])
    expect(engine.getCellValue(adr('B3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('different sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({Sheet1: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }]], Sheet2: [[{ cellValue: '=-Sheet1!A1:C1' }]]})
    expect(engine.getCellValue(adr('A1', 1))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })
})

describe('array parsing', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([[{ cellValue: '={ASYNC_FOO(),2;3,4}' }]])

    await promise

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('simple array', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '={1,2;3,4}' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('nested arrays', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '={1,{2,3},4;{5;6},{7,8;9,10},{11;12};13,{14,15},16}' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]])
  })

  it('size mismatch', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '={1,2;3}' }]])
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.REF, ErrorMessage.SizeMismatch))
  })

  it('nested with ops', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ARRAYFORMULA({1,{2,3}+{0,0},4;{5;6},2*{7,8;9,10},-{11;12};13,{14,15},16})' }]])
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [5, 14, 16, -11], [6, 18, 20, -12], [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}]])
  })
})

describe('vectorization', () => {
  it('1 arg function row', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ABS({-2,-1,1,2})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 2}]])
  })

  it('1 arg function column', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ABS({2;-2})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }], [{ cellValue: 2 }]])
  })

  it('1 arg function square', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ABS({1,2;-1,-2})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('1 arg function no flag - should cast to scalar', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ABS({-2,-1,1,2})' }]], {useArrayArithmetic: false})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }]])
  })

  it('multi arg function', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=DATE({1,2},1,1)' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 367 }, { cellValue: 732 }]])
  })

  it('multi arg function #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=DATE({1,2},{1,2},{1,2})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 367 }, { cellValue: 764 }]])
  })

  it('multi arg function #3', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=DATE({1,2},{1;2},{1})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 367 }, { cellValue: 732 }], [{ cellValue: 367 }, { cellValue: 732 }]])
  })

  it('multi arg function #4', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=DATE({1,2},{1,2,3},{1})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[367, 763, detailedError(ErrorType.VALUE, ErrorMessage.InvalidDate)]])
  })

  it('mixed types', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=ZTEST({1,2,1},{2;3})' }]], {useArrayArithmetic: true})
    const val = engine.getSheetValues(0)
    expect(val.length).toEqual(2)
    expect(val[0].length).toEqual(1)
    expect(val[1].length).toEqual(1)
  })

  it('no vectorization here #1', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=SUM({1,2,1},{2;3})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 9 }]])
  })

  it('no vectorization here #2', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=AND({TRUE(),FALSE()},{TRUE();FALSE()})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: false }]])
  })

  it('vectorize with defaults', () => {
    const [engine] = HyperFormula.buildFromArray([[{ cellValue: '=IF({TRUE(),FALSE()},{1;2;3}, {2;3})' }]], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('should work with switch', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SWITCH({1,2,3},1,2,3,4,5)' }]
    ], {useArrayArithmetic: true})
    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 5 }, { cellValue: 4 }]])
  })
})

describe('build from array', () => {
  it('should create engine with array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=-A1:B2' }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([
      [1, 2, -1, -2],
      [3, 4, -3, -4],
    ])
  })

  it('should be enough to specify only corner of an array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRANSPOSE(D1:E2)' }],
    ], {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex],
    ])
  })

  it('should be separate arrays', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
    ], {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, undefined],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [undefined, ArrayVertex, ArrayVertex],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(4)
    expect(engine.getSheetValues(0))
  })

  it('should REF last array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: null }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [{ cellValue: undefined }, { cellValue: undefined }],
    ])
    expect(engine.getSheetValues(0)).toEqual([
      [noSpace(), 1, 1, 1, 2],
      [noSpace(), 2, 2, 1, 2],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(3)
    expect(engine.getSheetValues(0))
  })

  it('array should work with different types of data', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=TRANSPOSE(A1:B2)' }],
      [{ cellValue: true }, { cellValue: '=SUM(A1)' }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([
      [{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: 1 }, { cellValue: true}],
      [{ cellValue: true }, { cellValue: 1 }, { cellValue: 'foo' }, { cellValue: 1}],
    ])
  })

  it('array should work with async data', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([
      [{ cellValue: '=ASYNC_ARRAY_FOO()' }],
    ], {useArrayArithmetic: true})

    engine.setCellContents(adr('C1'), '=TRANSPOSE(A1:B2)')

    await promise

    expect(engine.getSheetValues(0)).toEqual([
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1}], 
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1}]
    ])
  })

  it('should make REF array if no space', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-C1:D2' }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([
      [noSpace(), 2],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ])
  })

  it('should not shrink array if empty vertex', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: null }, { cellValue: null }]
    ], {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex],
    ])

  })

  it('should shrink to one vertex if there is more content colliding with array', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: null }]
    ], {useArrayArithmetic: true})

    expect(engine.arrayMapping.getArrayByCorner(adr('A1'))?.array.size).toEqual(ArraySize.error())
    expectVerticesOfTypes(engine, [
      [ArrayVertex, undefined],
      [ValueCellVertex, undefined],
    ])
  })

  it('DependencyGraph changes should be empty after building fresh engine', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: null }]
    ], {useArrayArithmetic: true})

    expect(engine.dependencyGraph.getAndClearContentChanges().isEmpty()).toEqual(true)
  })
})

describe('column ranges', () => {
  it('async functions should work for column range', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([
      [{ cellValue: '=2*(B:B)' }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: '=ASYNC_FOO(B1)' }],
    ], {useArrayArithmetic: true})

    await promise

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }]])
  })

  it('arithmetic should work for column range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=2*(B:B)' }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 2 }, { cellValue: 1 }]])
  })

  it('arithmetic should work for row range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=2*(2:2)' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 4 }], [{ cellValue: 2 }, { cellValue: 4 }]])
  })

  it('arithmetic for shifted column range -- error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: 1 }],
      [{ cellValue: '=2*(B:B)' }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult))
  })

  it('arithmetic should work for row range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=2*(2:2)' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expect(engine.getSheetValues(0)).toEqual([[{ cellValue: 2 }, { cellValue: 4 }], [{ cellValue: 2 }, { cellValue: 4 }]])
  })

  it('arithmetic for shifted row range -- error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: null }, { cellValue: '=2*(2:2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }],
    ], {useArrayArithmetic: true})

    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult))
  })

  it('sumproduct test', () => {
    const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 3 }, { cellValue: '=SUMPRODUCT((A:A=1)*(B:B=1), C:C)'}],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 3 }],
      ], {useArrayArithmetic: true}
    )

    expect(engine.getCellValue(adr('D1'))).toEqual(3)
  })

})
