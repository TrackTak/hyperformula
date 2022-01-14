import {ErrorType, HyperFormula} from '../src'
import {ArraySize} from '../src/ArraySize'
import {ArrayVertex, ValueCellVertex} from '../src/DependencyGraph'
import {ErrorMessage} from '../src/error-message'
import AsyncTestPlugin from './helpers/AsyncTestPlugin'
import {adr, detailedError, detailedErrorWithOrigin, expectVerticesOfTypes, noSpace} from './testUtils'

describe('without arrayformula, with useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=ASYNC_FOO(A1)' }], [{ cellValue: '=SUM(-A1:C1)' }]] }, {useArrayArithmetic: true})
    
    await promise

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-9)
  })

  it('unary op, scalar ret', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(-A1:C1)' }]] }, {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-6)
  })

  it('unary op, array ret', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=-A1:C1' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: -1 }, { cellValue: -2 }, { cellValue: -3 }]])
  })

  it('binary op, scalar ret', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: '=SUM(2*A1:C1+A2:C2)' }]] }, {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(27)
  })

  it('binary op, array ret', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: '=2*A1:C1+A2:C2' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: 6 }, { cellValue: 9 }, { cellValue: 12 }]])
  })

  it('binary op, array ret, concat', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: 'd' }, { cellValue: 'e' }, { cellValue: 'f' }], [{ cellValue: '=A1:C1&A2:C2' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }], [{ cellValue: 'd' }, { cellValue: 'e' }, { cellValue: 'f' }], [{ cellValue: 'ad' }, { cellValue: 'be' }, { cellValue: 'cf' }]])
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=INDEX(2*A1:C1+3,1,1)' }]] }, {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(5)
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,1,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,2,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,3,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,3)' }],
    ] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [{ cellValue:2}, { cellValue:4}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C4')}],
        [{ cellValue:8}, { cellValue:10}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C5')}],
        [{ cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A6')}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!B6')}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C6') }]])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(10,2*A2:E2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
    ] }, {useArrayArithmetic: true})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
  })
})

describe('without arrayformula, without useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(-A1:C1)'}]] }, {useArrayArithmetic: false})
    
    await promise

    expect(engine.getCellValue(adr('D2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('unary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(-A1:C1)'}]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('binary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=SUM(2*A1:C1+A2:C2)'}]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: undefined }, { cellValue: undefined }, { cellValue: undefined }, { cellValue: '=INDEX(2*A1:C1+3,1,1)'}]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('D2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,1,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,1,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,2,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,2,3)' }],
      [{ cellValue: '=INDEX(A1:C2+A1:B3,3,1)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,2)' }, { cellValue: '=INDEX(A1:C2+A1:B3,3,3)' }],
    ] }, {useArrayArithmetic: false})
    expect(engine.getSheetValues(0).cells).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [{ cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A4', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B4', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C4', ErrorMessage.ScalarExpected)}],
        [{ cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A5', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B5', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C5', ErrorMessage.ScalarExpected)}],
        [{ cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!A6', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!B6', ErrorMessage.ScalarExpected)}, { cellValue:detailedErrorWithOrigin(ErrorType.VALUE, 'Sheet1!C6', ErrorMessage.ScalarExpected)}]
      ])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(10,2*B1:F1)' }, { cellValue: 1 }, { cellValue: 2 }, { cellValue: 3}, {cellValue: 4 }, { cellValue: 5 }],
    ] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })
})

describe('with arrayformula, without useArrayArithmetic flag', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=ASYNC_FOO(A1)' }], [{ cellValue: '=ARRAYFORMULA(SUM(-A1:C1))' }]] }, {useArrayArithmetic: false})
    
    await promise
    
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-9)
  })

  it('unary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(SUM(-A1:C1))' }]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-6)
  })

  it('unary op #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SUM(ARRAYFORMULA(-A1:C1))' }]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-6)
  })

  it('binary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: '=ARRAYFORMULA(SUM(2*A1:C1+A2:C2))' }]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(27)
  })

  it('binary op #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }], [{ cellValue: '=SUM(ARRAYFORMULA(2*A1:C1+A2:C2))' }]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(27)
  })

  it('index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(INDEX(2*A1:C1+3,1,1))' }]] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(5)
  })

  it('binary op + index', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,1,3))' }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,2,3))' }],
      [{ cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,1))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,2))' }, { cellValue: '=ARRAYFORMULA(INDEX(A1:C2+A1:B3,3,3))' }],
    ] }, {useArrayArithmetic: false})
    expect(engine.getSheetValues(0).cells).toEqual(
      [
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 4 }, { cellValue: 5 }, { cellValue: 6 }],
        [{ cellValue: 7 }, { cellValue: 8 }, { cellValue: 9 }],
        [{ cellValue:2}, { cellValue: 4}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C4')}],
        [{ cellValue:8}, { cellValue:10}, { cellValue: detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C5')}],
        [{ cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!A6')}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!B6')}, { cellValue:detailedErrorWithOrigin(ErrorType.NA, 'Sheet1!C6')}]])
  })

  it('match', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ARRAYFORMULA(MATCH(10,2*A2:E2))' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
    ] }, {useArrayArithmetic: false})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(5)
  })
})

describe('coercion of array to scalar', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(2*A1:C1)+ARRAYFORMULA(2*A1:C1)' }]]})
    
    await promise

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }]])
  })

  it('actual range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=SIN(A1:C1)'}]]})
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('ad-hoc array + function #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=SIN(ARRAYFORMULA(2*A1:C1))' }]]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('ad-hoc array + function #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SIN({0,2,3})' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })

  it('ad-hoc array + binary op #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=ARRAYFORMULA(2*A1:C1)+ARRAYFORMULA(2*A1:C1)' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 4 }]])
  })

  it('ad-hoc array + binary op #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '={1,2,3}+{1,2,3}' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }]])
  })

  it('ad-hoc array + unary op #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: '=-ARRAYFORMULA(2*A1:C1)' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }], [{ cellValue: -2 }]])
  })

  it('ad-hoc array + unary op #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=-{1,2,3}' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: -1 }]])
  })
})

describe('range interpolation', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }], [{ cellValue: '=EXP(A1:C1)' }]]})
    
    await promise

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('with function', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: '=EXP(A1:C1)' }]]})
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
  })

  it('with binary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=A1:C1+A1:C1' }]]})
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(2)
  })

  it('with unary op', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=-A1:C1' }]]})
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(-1)
  })

  it('columns', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }], [{ cellValue: 1 }, { cellValue: '=-A1:A3' }], [{ cellValue: 0 }]]})
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual(-1)
  })

  it('too many rows', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }], [{ cellValue: undefined }, { cellValue: '=-A1:C2' }]]})
    expect(engine.getCellValue(adr('B3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })

  it('different sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1:  { cells: [[{ cellValue: 0 }, { cellValue: 1 }, { cellValue: 2 }]] },
      Sheet2: { cells: [[{ cellValue: '=-Sheet1!A1:C1' }]] }
    })
    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
  })
})

describe('array parsing', () => {
  it('with async function', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '={ASYNC_FOO(),2;3,4}' }]]})

    await promise

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 4 }]])
  })

  it('simple array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '={1,2;3,4}' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 3 }, { cellValue: 4 }]])
  })

  it('nested arrays', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '={1,{2,3},4;{5;6},{7,8;9,10},{11;12};13,{14,15},16}' }]]})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [{ cellValue: 5 }, { cellValue: 7 }, { cellValue: 8 }, { cellValue: 11 }], [{ cellValue: 6 }, { cellValue: 9 }, { cellValue: 10 }, { cellValue: 12}], [{ cellValue: 13 }, { cellValue: 14 }, { cellValue: 15 }, { cellValue: 16}]])
  })

  it('size mismatch', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '={1,2;3}' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.SizeMismatch))
  })

  it('nested with ops', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ARRAYFORMULA({1,{2,3}+{0,0},4;{5;6},2*{7,8;9,10},-{11;12};13,{14,15},16})' }]]})

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}], [{ cellValue: 5 }, { cellValue: 14 }, { cellValue: 16 }, { cellValue: -11 }], [{ cellValue: 6 }, { cellValue: 18 }, { cellValue: 20 }, { cellValue: -12}], [{ cellValue: 13 }, { cellValue: 14 }, { cellValue: 15 }, { cellValue: 16 }]])
  })
})

describe('vectorization', () => {
  it('1 arg function row', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ABS({-2,-1,1,2})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 2}]])
  })

  it('1 arg function column', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ABS({2;-2})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }], [{ cellValue: 2 }]])
  })

  it('1 arg function square', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ABS({1,2;-1,-2})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('1 arg function no flag - should cast to scalar', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ABS({-2,-1,1,2})' }]] }, {useArrayArithmetic: false})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }]])
  })

  it('multi arg function', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATE({1,2},1,1)' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 367 }, { cellValue: 732 }]])
  })

  it('multi arg function #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATE({1,2},{1,2},{1,2})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 367 }, { cellValue: 764 }]])
  })

  it('multi arg function #3', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATE({1,2},{1;2},{1})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 367 }, { cellValue: 732 }], [{ cellValue: 398 }, { cellValue: 763 }]])
  })

  it('multi arg function #4', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=DATE({1,2},{1,2,3},{1})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 367}, { cellValue: 763}, { cellValue: detailedError(ErrorType.VALUE, ErrorMessage.InvalidDate)}]])
  })

  it('mixed types', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ZTEST({1,2,1},{2;3})' }]] }, {useArrayArithmetic: true})
    const val = engine.getSheetValues(0).cells
    expect(val.length).toEqual(2)
    expect(val[0].length).toEqual(1)
    expect(val[1].length).toEqual(1)
  })

  it('no vectorization here #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SUM({1,2,1},{2;3})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 9 }]])
  })

  it('no vectorization here #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=AND({TRUE(),FALSE()},{TRUE();FALSE()})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: false }]])
  })

  it('vectorize with defaults', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=IF({TRUE(),FALSE()},{1;2;3}, {2;3})' }]] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2 }], [{ cellValue: 2 }, { cellValue: 3 }], [{ cellValue: 3 }, { cellValue: false }]])
  })

  it('should work with switch', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SWITCH({1,2,3},1,2,3,4,5)' }]
    ] }, {useArrayArithmetic: true})
    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }, { cellValue: 5 }, { cellValue: 4 }]])
  })
})

describe('build from array', () => {
  it('should create engine with array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: '=-A1:B2' }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue:-1 }, { cellValue:-2 }],
      [{ cellValue:3 }, { cellValue:4 }, { cellValue:-3 }, { cellValue:-4 }],
    ])
  })

  it('should be enough to specify only corner of an array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(D1:E2)' }],
    ] }, {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex],
    ])
  })

  it('should be separate arrays', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }],
    ] }, {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, undefined],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [undefined, ArrayVertex, ArrayVertex],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(4)
    expect(engine.getSheetValues(0).cells)
  })

  it('should REF last array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
      [{ cellValue: '=TRANSPOSE(D1:E2)' }, { cellValue: null }, { cellValue: null }, { cellValue: 1}, {cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex, ArrayVertex],
      [undefined, undefined],
    ])
    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: noSpace() }, { cellValue: 1}, { cellValue:1}, { cellValue:1}, { cellValue:2}],
      [{ cellValue: noSpace() }, { cellValue: 2}, { cellValue:2}, { cellValue:1}, { cellValue:2}],
    ])
    expect(engine.arrayMapping.arrayMapping.size).toEqual(3)
    expect(engine.getSheetValues(0).cells)
  })

  it('array should work with different types of data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=TRANSPOSE(A1:B2)' }],
      [{ cellValue: true }, { cellValue: '=SUM(A1)' }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: 1 }, { cellValue: true}],
      [{ cellValue: true }, { cellValue: 1 }, { cellValue: 'foo' }, { cellValue: 1}],
    ])
  })

  it('array should work with async data', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASYNC_ARRAY_FOO()' }],
    ] }, {useArrayArithmetic: true})

    engine.setCellContents(adr('C1'), { cellValue: '=TRANSPOSE(A1:B2)' })

    await promise

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1}], 
      [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 1 }, { cellValue: 1}]
    ])
  })

  it('should make REF array if no space', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-C1:D2' }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getSheetValues(0).cells).toEqual([
      [{ cellValue: noSpace() }, { cellValue: 2 }],
      [{ cellValue: 3 }, { cellValue: 4 }],
    ])
  })

  it('should not shrink array if empty vertex', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: null }, { cellValue: null }]
    ] }, {useArrayArithmetic: true})

    expectVerticesOfTypes(engine, [
      [ArrayVertex, ArrayVertex],
      [ArrayVertex, ArrayVertex],
    ])
  })

  it('should shrink to one vertex if there is more content colliding with array', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: null }]
    ] }, {useArrayArithmetic: true})

    expect(engine.arrayMapping.getArrayByCorner(adr('A1'))?.array.size).toEqual(ArraySize.error())
    expectVerticesOfTypes(engine, [
      [ArrayVertex, undefined],
      [ValueCellVertex, undefined],
    ])
  })

  it('DependencyGraph changes should be empty after building fresh engine', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-C1:D2' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: null }]
    ] }, {useArrayArithmetic: true})

    expect(engine.dependencyGraph.getAndClearContentChanges().isEmpty()).toEqual(true)
  })

  it('should not have SPILL error when cell values are empty', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '={1,2}' }, { cellValue: null, metadata: {test: 'value'} }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B1'))).toEqual({
      cellValue: 2,
      metadata: {test: 'value'}
    })
  })
})

describe('column ranges', () => {
  it('async functions should work for column range', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=2*(B:B)' }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: '=ASYNC_FOO(B1)' }],
    ] }, {useArrayArithmetic: true})

    await promise

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 12 }, { cellValue: 6 }]])
  })

  it('arithmetic should work for column range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=2*(B:B)' }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }, { cellValue: 1 }], [{ cellValue: 4 }, { cellValue: 2 }]])
  })

  it('arithmetic should work for row range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=2*(2:2)' }, { cellValue: null }],
      [{ cellValue: 1 }, { cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 2 }, { cellValue: 4 }], [{ cellValue: 1 }, { cellValue: 2 }]])
  })

  it('arithmetic for shifted column range -- error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: 1 }],
      [{ cellValue: '=2*(B:B)' }, { cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult))
  })

  it('arithmetic for shifted row range -- error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: '=2*(2:2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }],
    ] }, {useArrayArithmetic: true})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult))
  })

  it('sumproduct test', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: 1 }, { cellValue: 1 }, { cellValue: 3 }, { cellValue: '=SUMPRODUCT((A:A=1)*(B:B=1), C:C)'}],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
        [{ cellValue: 3 }, { cellValue: 1 }, { cellValue: 3 }],
      ] }, {useArrayArithmetic: true}
    )

    expect(engine.getCellValue(adr('D1')).cellValue).toEqual(3)
  })

})
