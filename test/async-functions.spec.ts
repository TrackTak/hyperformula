import {EvaluationSuspendedError, ExportedCellChange, ExportedNamedExpressionChange, HyperFormula} from '../src'
import {ErrorType} from '../src/Cell'
import {Config} from '../src/Config'
import {Events} from '../src/Emitter'
import {ErrorMessage} from '../src/error-message'
import {InterpreterState} from '../src/interpreter/InterpreterState'
import {AsyncInternalScalarValue} from '../src/interpreter/InterpreterValue'
import {ArgumentTypes, FunctionPlugin, FunctionPluginTypecheck} from '../src/interpreter/plugin/FunctionPlugin'
import {ProcedureAst} from '../src/parser'
import {adr, detailedError, detailedErrorWithOrigin, expectEngineToBeTheSameAs} from './testUtils'

class AsyncPlugin extends FunctionPlugin implements FunctionPluginTypecheck<AsyncPlugin> {
  public static implementedFunctions = {
    'ASYNC_FOO': {
      method: 'asyncFoo',
      parameters: [
        {argumentType: ArgumentTypes.ANY}
      ],
    },
    'LONG_ASYNC_FOO': {
      method: 'longAsyncFoo',
      parameters: [
        {argumentType: ArgumentTypes.ANY}
      ],
    },
    'TIMEOUT_FOO': {
      method: 'timeoutFoo',
    },
    'ASYNC_ERROR_FOO': {
      method: 'asyncErrorFoo',
    },
  }

  public static translations = {
    'enGB': {
      'ASYNC_FOO': 'ASYNC_FOO',
      'LONG_ASYNC_FOO': 'LONG_ASYNC_FOO',
      'TIMEOUT_FOO': 'TIMEOUT_FOO',
      'ASYNC_ERROR_FOO': 'ASYNC_ERROR_FOO'
    },
    'plPL': {
      'ASYNC_FOO': 'ASYNC_FOO',
      'LONG_ASYNC_FOO': 'LONG_ASYNC_FOO',
      'TIMEOUT_FOO': 'TIMEOUT_FOO',
      'ASYNC_ERROR_FOO': 'ASYNC_ERROR_FOO'
    }
  }

  public async asyncFoo(ast: ProcedureAst, state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(resolve => setTimeout(() => {
      if (ast.args[0]) {
        const argument = this.evaluateAst(ast.args[0], state) as number

        resolve(argument + 5)

        return
      }
  
      resolve(1)
    }, 100))
  }
  
  public async longAsyncFoo(ast: ProcedureAst, state: InterpreterState): AsyncInternalScalarValue {
    return new Promise(resolve => setTimeout(() => {
      const argument = this.evaluateAst(ast.args[0], state) as number

      resolve(argument + ' longAsyncFoo')
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

  describe('operations', () => {
    it('plus op', async() => {
      const [engine, promise] = HyperFormula.buildFromArray([
        [1, '=ASYNC_FOO()+ASYNC_FOO(A1)'],
      ])
  
      expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1')]])
  
      await promise
  
      expect(engine.getSheetValues(0)).toEqual([[1, 7]])
    })

    it('unary minus op', async() => {
      const [engine, promise] = HyperFormula.buildFromArray([
        [1, '=-ASYNC_FOO()'],
      ])
  
      expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1')]])
  
      await promise
  
      expect(engine.getSheetValues(0)).toEqual([[1, -1]])
    })
  })

  describe('recompute partial formulas', () => {
    it('async values are calculated after promises resolve', async() => {
      const [engine] = HyperFormula.buildFromArray([])

      const [, promise] = engine.setSheetContent(0, [[1, '=ASYNC_FOO()', '=SUM(A1:B1)', '=ASYNC_FOO(A1)']])

      expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1'), getLoadingError('Sheet1!B1'), getLoadingError('Sheet1!D1')]])

      const asyncChanges = await promise

      expect(engine.getSheetValues(0)).toEqual([[1, 1, 2, 6]])
      expect(asyncChanges).toEqual([new ExportedCellChange(adr('B1'), 1), new ExportedCellChange(adr('C1'), 2), new ExportedCellChange(adr('D1'), 6)])
    })

    it('asyncValuesUpdated fires once per public async action', async() => {
      const [engine] = HyperFormula.buildFromArray([])
      const handler = jasmine.createSpy()

      engine.on(Events.AsyncValuesUpdated, handler)

      await engine.setSheetContent(0, [['=ASYNC_FOO()']])[1]

      expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 1)])

      await engine.setSheetContent(0, [['=ASYNC_FOO()', '=ASYNC_FOO()', '=ASYNC_FOO()']])[1]

      expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 1), new ExportedCellChange(adr('B1'), 1), new ExportedCellChange(adr('C1'), 1)])
      expect(handler).toHaveBeenCalledTimes(2)
    })
  })
    
  describe('recompute all formulas', () => {
    it('async values are calculated after promises resolve', async() => {
      const [engine, promise] = HyperFormula.buildFromArray([
        [1, '=ASYNC_FOO()', '=SUM(A1:B1)', '=ASYNC_FOO(A1)'],
      ])

      expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1'), getLoadingError('Sheet1!B1'), getLoadingError('Sheet1!D1')]])

      await promise

      expect(engine.getSheetValues(0)).toEqual([[1, 1, 2, 6]])
    })

    it('should return #TIMEOUT error if function does not resolve due to the request taking too long', async() => {
      const [engine, promise] = HyperFormula.buildFromArray([
        ['=TIMEOUT_FOO()', 'foo'],
      ])

      await promise

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.TIMEOUT, ErrorMessage.FunctionTimeout))
      expect(engine.getCellValue(adr('B1'))).toBe('foo')
    }, Config.defaultConfig.timeoutTime + 3000)

    it('should throw an error if function does not resolve', async() => {      
      const [, promise] = HyperFormula.buildFromArray([
        ['=ASYNC_ERROR_FOO()'],
      ])

      try {
        await promise
      } catch (error) {
        expect(error).toEqualError(new Error('asyncErrorFoo'))
      }
    })
  })

  it('handles promise races gracefully', async() => {
    const [engine, enginePromise] = HyperFormula.buildFromArray([[
      'foo', '=LONG_ASYNC_FOO(A1)'
    ]])

    const [, cellContentPromise] = engine.setCellContents(adr('A1'), '=ASYNC_FOO()')

    expect(engine.getSheetValues(0)).toEqual([[getLoadingError('Sheet1!A1'), getLoadingError('Sheet1!B1')]])

    await cellContentPromise

    expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1')]])

    await enginePromise

    expect(engine.getSheetValues(0)).toEqual([[1, '1 longAsyncFoo']])
  })

  it('works with multiple async functions one after another', async() => {
    const sheet = [[
      1, '=ASYNC_FOO()'
    ]]
    const [engine] = HyperFormula.buildFromArray(sheet)

    const [,promise] = engine.setSheetContent(0, [[
      '=ASYNC_FOO()', 1
    ]])

    await promise

    expect(engine.getSheetValues(0)).toEqual([[
      1, 1
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
    const [engine] = HyperFormula.buildFromArray([[
      1
    ]])
    
    const [cellValue, promise] = engine.calculateFormula('=ASYNC_FOO(A1)', 0)

    expect(cellValue).toEqual(detailedError(ErrorType.LOADING, ErrorMessage.FunctionLoading))

    const newCellValue = await promise

    expect(newCellValue).toEqual(6)
  })

  it('batch works with async functions', async() => {
    const [engine] = HyperFormula.buildFromArray([[]])

    const [,promise] = engine.batch(() => {
      engine.setCellContents(adr('A1'), 1)
      engine.setCellContents(adr('B1'), '=ASYNC_FOO()')

      try {
        engine.getSheetValues(0)
      } catch(error) {
        expect(error).toEqualError(new EvaluationSuspendedError())
      }
    })

    expect(engine.getSheetValues(0)).toEqual([[1, getLoadingError('Sheet1!B1')]])

    const asyncChanges = await promise

    expect(engine.getSheetValues(0)).toEqual([[1, 1]])
    expect(asyncChanges).toEqual([new ExportedCellChange(adr('B1'), 1)])
  })

  describe('undo', () => {
    it('undo works with async functions before promises resolve', () => {
      const sheet = [[
        1, '=ASYNC_FOO()'
      ]]
      const [engine] = HyperFormula.buildFromArray(sheet)
  
      engine.setSheetContent(0, [[
        '=ASYNC_FOO()', 1
      ]])
  
      engine.undo()

      const [expectedEngine] = HyperFormula.buildFromArray(sheet)

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })

    it('undo works with async functions after promises resolve', async() => {
      const sheet = [[
        2, '=ASYNC_FOO()'
      ]]
      const [engine] = HyperFormula.buildFromArray(sheet)
  
      const [,promise] = engine.setSheetContent(0, [[
        '=ASYNC_FOO()', 2
      ]])

      await promise
  
      engine.undo()

      const [expectedEngine, enginePromise] = HyperFormula.buildFromArray(sheet)

      await enginePromise

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })
  })

  describe('redo', () => {
    it('redo works with async functions before promises resolve', () => {
      const [engine] = HyperFormula.buildFromArray([[
        1, '=ASYNC_FOO()'
      ]])
  
      const sheet = [[
        '=ASYNC_FOO()', 1
      ]]

      engine.setSheetContent(0, sheet)
  
      engine.undo()
      engine.redo()

      const [expectedEngine] = HyperFormula.buildFromArray(sheet)

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })

    it('redo works with async functions after promises resolve', async() => {
      const [engine] = HyperFormula.buildFromArray([[
        '=ASYNC_FOO()', 2
      ]])
  
      const sheet = [[
        2, '=ASYNC_FOO()'
      ]]

      const [,promise] = engine.setSheetContent(0, sheet)

      await promise
  
      engine.undo()
      engine.redo()

      const [expectedEngine, enginePromise] = HyperFormula.buildFromArray(sheet)

      await enginePromise

      expectEngineToBeTheSameAs(engine, expectedEngine)
    })
  })
})
