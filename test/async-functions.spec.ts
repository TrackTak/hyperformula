import {CellData, CellError, EvaluationSuspendedError, ExportedCellChange, ExportedNamedExpressionChange, HyperFormula, SimpleRangeValue} from '../src'
import {ArraySize} from '../src/ArraySize'
import {ErrorType} from '../src/Cell'
import {Config} from '../src/Config'
import {Events} from '../src/Emitter'
import {ErrorMessage} from '../src/error-message'
import {InterpreterState} from '../src/interpreter/InterpreterState'
import {AsyncInternalScalarValue} from '../src/interpreter/InterpreterValue'
import {ArgumentTypes, FunctionPlugin, FunctionPluginTypecheck} from '../src/interpreter/plugin/FunctionPlugin'
import {AsyncSimpleRangeValue} from '../src/interpreter/SimpleRangeValue'
import {ProcedureAst} from '../src/parser'
import {adr, detailedError, detailedErrorWithOrigin, expectEngineToBeTheSameAs} from './testUtils'

class AsyncPlugin extends FunctionPlugin implements FunctionPluginTypecheck<AsyncPlugin> {
  public static implementedFunctions = {
    'ASYNC_FOO': {
      method: 'asyncFoo',
      isAsyncMethod: true,
      parameters: [
        {argumentType: ArgumentTypes.ANY}
      ],
    },
    'ASYNC_ARRAY_FOO': {
      method: 'asyncArrayFoo',
      arraySizeMethod: 'asyncArrayFooSize',
      isAsyncMethod: true,
    },
    'LONG_ASYNC_FOO': {
      method: 'longAsyncFoo',
      isAsyncMethod: true,
      parameters: [
        {argumentType: ArgumentTypes.ANY}
      ],
    },
    'TIMEOUT_FOO': {
      method: 'timeoutFoo',
      isAsyncMethod: true,
    },
    'ASYNC_ERROR_FOO': {
      method: 'asyncErrorFoo',
      isAsyncMethod: true,
    },
  }

  public static translations = {
    'enGB': {
      'ASYNC_FOO': 'ASYNC_FOO',
      'ASYNC_ARRAY_FOO': 'ASYNC_ARRAY_FOO',
      'LONG_ASYNC_FOO': 'LONG_ASYNC_FOO',
      'TIMEOUT_FOO': 'TIMEOUT_FOO',
      'ASYNC_ERROR_FOO': 'ASYNC_ERROR_FOO'
    },
  }

  public asyncFoo(ast: ProcedureAst, state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(resolve => setTimeout(() => {
      if (ast.args[0]) {
        const argument = this.evaluateAst(ast.args[0], state) as number

        resolve(argument + 5)
        return
      }
  
      resolve(1)
    }, 100))
  }

  public asyncArrayFoo(_ast: ProcedureAst, _state: InterpreterState): AsyncSimpleRangeValue {
    return new Promise(resolve => setTimeout(() => {
      resolve(SimpleRangeValue.onlyValues([[1, 1], [1, 1]]))
    }, 100))
  }

  public asyncArrayFooSize(ast: ProcedureAst, _state: InterpreterState) {
    if (ast.asyncPromise?.getIsResolvedValue()) {
      const value = ast.asyncPromise?.getResolvedValue() as SimpleRangeValue

      return value.size
    }
    return ArraySize.error()
  }
  
  public async longAsyncFoo(ast: ProcedureAst, state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(resolve => setTimeout(() => {
      const argument = this.evaluateAst(ast.args[0], state)

      if (argument instanceof CellError) {
        resolve(argument)

        return
      }
      
      resolve(argument as number + ' longAsyncFoo')
    }, 3000))
  }

  public async timeoutFoo(_ast: ProcedureAst, _state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(resolve => setTimeout(() => resolve('timeoutFoo'), Config.defaultConfig.timeoutTime + 10000))
  }

  public async asyncErrorFoo(_ast: ProcedureAst, _state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(() => {
      throw new Error('asyncErrorFoo')
    })
  }
}

const getLoadingError = (address: string) => detailedErrorWithOrigin(ErrorType.LOADING, address, ErrorMessage.FunctionLoading)

describe('async functions', () => {
  beforeEach(() => {
    HyperFormula.registerFunctionPlugin(AsyncPlugin, AsyncPlugin.translations)
  })
  
  afterEach(() => {
    HyperFormula.unregisterFunctionPlugin(AsyncPlugin)
  })

  describe('operations buildFromArray', () => {
    it('plus op', async() => {
      const [engine, promise] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: 1 }, { cellValue: '=ASYNC_FOO()+ASYNC_FOO(A1)' }],
      ]})
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: getLoadingError('Sheet1!B1') }]])
  
      await promise
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 7 }]])
    })

    it('nested cell reference op', async() => {
      const [engine, promise] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '=ASYNC_FOO() / 10' }],
        [{ cellValue: '=A1+1' }]
      ]})
    
      await promise
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: .1 }], [{ cellValue: 1.1 }]])
    })

    it('async functions operations on dependent async value', async() => {
      const [engine, promise] = HyperFormula.buildFromArray({ cells: [[
        { cellValue: '=ASYNC_FOO()' }, { cellValue: '=ASYNC_FOO()+A1' }
      ]]})
  
      await promise
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 2}]])

    })  

    it('unary minus op', async() => {
      const [engine, promise] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: 1 }, { cellValue: '=-ASYNC_FOO()' }],
      ]})
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: getLoadingError('Sheet1!B1') }]])
  
      await promise
  
      expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: -1 }]])
    })
  })

  describe('exported changes', () => {
    it('async values are calculated after promises resolve', async() => {
      const [engine] = HyperFormula.buildFromArray({ cells: [] })

      const [, promise] = engine.setSheetContent(0, [[{ cellValue: 1 }, { cellValue: '=ASYNC_FOO()' }, { cellValue: '=SUM(A1:B1)' }, { cellValue: '=ASYNC_FOO(A1)'}]])

      const changes = await promise

      expect(changes).toEqual([new ExportedCellChange(adr('B1'), new CellData(1)), new ExportedCellChange(adr('D1'), new CellData(6)), new ExportedCellChange(adr('C1'), new CellData(2))])
    })

    it('asyncValuesUpdated fires once per public async action', async() => {
      const [engine] = HyperFormula.buildFromArray({ cells: [] })
      const handler = jasmine.createSpy()

      engine.on(Events.AsyncValuesUpdated, handler)

      await engine.setSheetContent(0, [[{ cellValue: '=ASYNC_FOO()' }]])[1]

      expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), new CellData(1))])

      const changes = await engine.setSheetContent(0, [[{ cellValue: '=ASYNC_FOO()' }, { cellValue: '=ASYNC_FOO()' }, { cellValue: '=ASYNC_FOO()' }]])[1]

      await engine.setCellContents(adr('D1'), { cellValue: 'test' })[1]

      expect(handler).toHaveBeenCalledTimes(2)
      expect(changes).toEqual([new ExportedCellChange(adr('A1'), new CellData(1)), new ExportedCellChange(adr('B1'), new CellData(1)), new ExportedCellChange(adr('C1'), new CellData(1))])
    })
  })

  it('should return #TIMEOUT error if function does not resolve due to the request taking too long', async() => {
    const [engine, promise] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TIMEOUT_FOO()' }, { cellValue: 'foo' }],
    ]})

    await promise

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.TIMEOUT, ErrorMessage.FunctionTimeout))
    expect(engine.getCellValue(adr('B1')).cellValue).toBe('foo')
  }, Config.defaultConfig.timeoutTime + 3000)

  it('should throw an error if function does not resolve', async() => {      
    const [, promise] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASYNC_ERROR_FOO()' }],
    ]})

    try {
      await promise
    } catch (error) {
      expect(error).toEqualError(new Error('asyncErrorFoo'))
    }
  })

  it('rebuildAndRecalculate', async() => {
    const [engine, promise] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=ASYNC_FOO()+2' }],
    ]})

    await promise

    await engine.rebuildAndRecalculate()

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 3 }]])
  })

  it('handles promise races gracefully', async() => {
    const [engine, enginePromise] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: 'foo' }, { cellValue: '=LONG_ASYNC_FOO(A1)' }
    ]]})

    const [, cellContentPromise] = engine.setCellContents(adr('A1'), { cellValue: '=ASYNC_FOO()' })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: getLoadingError('Sheet1!A1') }, { cellValue: getLoadingError('Sheet1!B1') }]])

    await Promise.all([
      enginePromise,
      cellContentPromise
    ])

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: '1 longAsyncFoo' }]])
  })

  it('works with multiple async functions one after another', async() => {
    const sheet = [[
      { cellValue: 2 }, { cellValue: '=ASYNC_FOO()' }
    ]]
    const [engine] = HyperFormula.buildFromArray({ cells: sheet })

    const [,promise] = engine.setSheetContent(0, [[
      { cellValue: '=ASYNC_FOO()' }, { cellValue: 3 }
    ]])

    await promise

    expect(engine.getSheetValues(0).cells).toEqual([[
      { cellValue: 1 }, { cellValue: 3 }
    ]])
  })

  it('async value recalculated when dependency changes', async() => {
    const sheet = [[
      { cellValue: 1 }, { cellValue: '=ASYNC_FOO(A1)' }
    ]]
    const [engine, promise] = HyperFormula.buildFromArray({ cells: sheet })

    await promise
    await engine.setCellContents(adr('A1'), { cellValue: 5 })[1]

    expect(engine.getSheetValues(0).cells).toEqual([[
      { cellValue: 5 }, { cellValue: 10 }
    ]])
  })

  it('named expressions works with async functions', async() => {
    const [engine] = HyperFormula.buildEmpty()
    const [changes, promise] = engine.addNamedExpression('asyncFoo', '=ASYNC_FOO()')

    expect(changes).toEqual([new ExportedNamedExpressionChange('asyncFoo', getLoadingError('asyncFoo'))])
    expect(engine.getNamedExpressionValue('asyncFoo')).toEqual(getLoadingError('asyncFoo'))

    const asyncChanges = await promise

    expect(engine.getNamedExpressionValue('asyncFoo')).toEqual(1)
    expect(asyncChanges).toEqual([new ExportedNamedExpressionChange('asyncFoo', 1)])
  })

  it('calculateFormula works with async functions', async() => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: 1 }
    ]]})
    
    const [cellValue, promise] = engine.calculateFormula('=ASYNC_FOO(A1)', 0)

    expect(cellValue).toEqual(detailedError(ErrorType.LOADING, ErrorMessage.FunctionLoading))

    const newCellValue = await promise

    expect(newCellValue).toEqual(6)
  })

  it('batch works with async functions', async() => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[]] })

    const [,promise] = engine.batch(() => {
      engine.setCellContents(adr('A1'), { cellValue: 1 })
      engine.setCellContents(adr('B1'), { cellValue: '=ASYNC_FOO()' })

      try {
        engine.getSheetValues(0).cells
      } catch(error) {
        expect(error).toEqualError(new EvaluationSuspendedError())
      }
    })

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: getLoadingError('Sheet1!B1') }]])

    const asyncChanges = await promise

    expect(engine.getSheetValues(0).cells).toEqual([[{ cellValue: 1 }, { cellValue: 1 }]])
    expect(asyncChanges).toEqual([new ExportedCellChange(adr('B1'), new CellData(1))])
  })

  describe('undo', () => {
    it('undo works with async functions before promises resolve', () => {
      const sheet = [[
        { cellValue: 1 }, { cellValue: '=ASYNC_FOO()' }
      ]]
      const [engine] = HyperFormula.buildFromArray({ cells: sheet })
  
      engine.setSheetContent(0, [[
        { cellValue: '=ASYNC_FOO()' }, { cellValue: 1 }
      ]])
  
      engine.undo()

      const [expectedEngine] = HyperFormula.buildFromArray({ cells: sheet })

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })

    it('undo works with async functions after promises resolve', async() => {
      const sheet = [[
        { cellValue: 2 }, { cellValue: '=ASYNC_FOO()' }
      ]]
      const [engine] = HyperFormula.buildFromArray({ cells: sheet })
  
      const [,promise] = engine.setSheetContent(0, [[
        { cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }
      ]])

      await promise
  
      engine.undo()

      const [expectedEngine, enginePromise] = HyperFormula.buildFromArray({ cells: sheet })

      await enginePromise

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })
  })

  describe('redo', () => {
    it('redo works with async functions before promises resolve', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [[
        { cellValue: 1 }, { cellValue: '=ASYNC_FOO()' }
      ]]})
  
      const sheet = [[
        { cellValue: '=ASYNC_FOO()' }, { cellValue: 1 }
      ]]

      engine.setSheetContent(0, sheet)
  
      engine.undo()
      engine.redo()

      const [expectedEngine] = HyperFormula.buildFromArray({ cells: sheet })

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })

    it('redo works with async functions after promises resolve', async() => {
      const [engine] = HyperFormula.buildFromArray({ cells: [[
        { cellValue: '=ASYNC_FOO()' }, { cellValue: 2 }
      ]]})
  
      const sheet = [[
        { cellValue: 2 }, { cellValue: '=ASYNC_FOO()' }
      ]]

      await engine.setSheetContent(0, sheet)[1]
      await engine.undo()[1]
      await engine.redo()[1]

      const [expectedEngine, enginePromise] = HyperFormula.buildFromArray({ cells: sheet })

      await enginePromise

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })
  })
})
