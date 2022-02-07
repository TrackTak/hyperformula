/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {CellError, SimpleCellAddress} from '.'
import {CancelablePromise, CanceledPromise, withTimeout} from './Cell'
import {Config} from './Config'
import {FunctionRegistry} from './interpreter/FunctionRegistry'
import {InterpreterState} from './interpreter/InterpreterState'
import {InterpreterValue} from './interpreter/InterpreterValue'
import {Ast, AstNodeType, ProcedureAst} from './parser'

type PromiseGetter = (state: InterpreterState) => CancelablePromise<InterpreterValue>

export class AsyncPromise {
  private isResolvedValue = false
  /** Most recently fetched value of this promise. */
  private resolvedValue?: InterpreterValue | CanceledPromise<InterpreterValue>
  private cancelablePromise?: CancelablePromise<InterpreterValue>

  constructor(
    private promiseGetter: PromiseGetter,
  ) {
    if (!promiseGetter) {
      throw Error('promiseGetter must be supplied')
    }
  }

  public startPromise(state: InterpreterState) {
    const cancelablePromise = this.promiseGetter(state)

    cancelablePromise.getPromise().then((value) => {
      this.resolvedValue = value
      this.isResolvedValue = true
    }).catch(() => {
      this.isResolvedValue = false
    })

    this.cancelablePromise = cancelablePromise

    return cancelablePromise
  }

  public getPromise() {
    return this.cancelablePromise
  }

  public getResolvedValue() {
    if (this.resolvedValue !== undefined) {
      return this.resolvedValue
    } else {
      throw Error('Value of the promise is not resolved.')
    }  
  }

  public getIsResolvedValue() {
    return this.isResolvedValue
  }

  public resetIsResolvedValue() {
    this.isResolvedValue = false
  }
}

export class AsyncPromiseFetcher {
  constructor(
    private readonly config: Config,
    private readonly functionRegistry: FunctionRegistry
  ) {
  }

  public setFunctionPromisesToAst(ast: Ast, formulaAddress: SimpleCellAddress): AsyncPromise[] {
    const value = this.checkFunctionPromisesForAst(ast, {formulaAddress, arraysFlag: this.config.useArrayArithmetic})
  
    return value.filter(x => x) as AsyncPromise[]
  }

  public checkFunctionPromisesForAst(ast: Ast, state: InterpreterState): (AsyncPromise | undefined)[] {
    switch (ast.type) {
      case AstNodeType.FUNCTION_CALL: {
        this.setAsyncPromiseToProcedureAst(ast)

        return [ast.asyncPromise]
      }
      case AstNodeType.DIV_OP:
      case AstNodeType.CONCATENATE_OP:
      case AstNodeType.EQUALS_OP:
      case AstNodeType.GREATER_THAN_OP:
      case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
      case AstNodeType.LESS_THAN_OP:
      case AstNodeType.LESS_THAN_OR_EQUAL_OP:
      case AstNodeType.MINUS_OP:
      case AstNodeType.NOT_EQUAL_OP:
      case AstNodeType.PLUS_OP:
      case AstNodeType.POWER_OP:
      case AstNodeType.TIMES_OP: {
        const left = this.checkFunctionPromisesForAst(ast.left, state)
        const right = this.checkFunctionPromisesForAst(ast.right, state)
        
        return [...left, ...right]
      }
      case AstNodeType.MINUS_UNARY_OP:
      case AstNodeType.PLUS_UNARY_OP:
      case AstNodeType.PERCENT_OP: {
        return this.checkFunctionPromisesForAst(ast.value, state)
      }
      case AstNodeType.PARENTHESIS: {
        return this.checkFunctionPromisesForAst(ast.expression, state)
      }
      case AstNodeType.ARRAY: {
        const values: (AsyncPromise | undefined)[] = []

        for (const row of ast.args) {
          row.map(ast => {
            const value = this.checkFunctionPromisesForAst(ast, state)

            values.push(...value)
          })
        }

        return [...values]
      }
      default:
        return []
    }
  }

  private setAsyncPromiseToProcedureAst(ast: ProcedureAst) {
    const metadata = this.functionRegistry.getMetadata(ast.procedureName)

    if (metadata?.isAsyncMethod) {
      const pluginFunction = this.functionRegistry.getAsyncFunction(ast.procedureName)

      if (pluginFunction !== undefined) {
        const promiseGetter = (state: InterpreterState) => {
          const promise = new Promise<InterpreterValue>((resolve, reject) => {
            const pluginFunctionValue = pluginFunction(ast, state)
            const functionPromise = withTimeout(pluginFunctionValue, this.config.timeoutTime)

            functionPromise.then((interpreterValue) => {
              resolve(interpreterValue)
            }).catch((error) => {
              if (error instanceof CellError) {
                resolve(error)
              } else {
                reject(error)
              }
            })
          })

          return new CancelablePromise(promise)
        }

        const asyncPromise = new AsyncPromise(promiseGetter)

        ast.asyncPromise = asyncPromise
      }
    }
  }
}

