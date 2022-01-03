import { CellError, ErrorType, FunctionPlugin, SimpleRangeValue } from '../../src'
import { ArraySize } from '../../src/ArraySize'
import { Config } from '../../src/Config'
import { ErrorMessage } from '../../src/error-message'
import { InterpreterState } from '../../src/interpreter/InterpreterState'
import { AsyncInternalScalarValue } from '../../src/interpreter/InterpreterValue'
import { ArgumentTypes, FunctionPluginTypecheck } from '../../src/interpreter/plugin/FunctionPlugin'
import { AsyncSimpleRangeValue } from '../../src/interpreter/SimpleRangeValue'
import { ProcedureAst } from '../../src/parser'
import { detailedErrorWithOrigin } from '../testUtils'

class AsyncTestPlugin extends FunctionPlugin implements FunctionPluginTypecheck<AsyncTestPlugin> {
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

export const getLoadingError = (address: string) => detailedErrorWithOrigin(ErrorType.LOADING, address, ErrorMessage.FunctionLoading)

export default AsyncTestPlugin