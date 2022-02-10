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

export type PromiseGetter = (state: InterpreterState) => CancelablePromise<InterpreterValue>

export type Chunked = {
  isChunked: boolean,
  chunkedIterator: number,
}

export class AsyncPromise {
  private isResolvedValue = false
  /** Most recently fetched value of this promise. */
  private resolvedValue?: InterpreterValue | CanceledPromise<InterpreterValue>
  private cancelablePromise?: CancelablePromise<InterpreterValue>
  public isWaitingOnPrecedentResolving = false

  constructor(
    private promiseGetter: PromiseGetter,
    public chunked: Chunked
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

  public getNewAstWithFunctionPromises(ast: Ast, formulaAddress: SimpleCellAddress): Ast {
    const newAst = this.checkFunctionPromisesForAst(ast, {formulaAddress, arraysFlag: this.config.useArrayArithmetic})
  
    return newAst
  }

  private checkFunctionPromisesForAst(ast: Ast, state: InterpreterState): Ast {
    switch (ast.type) {
      case AstNodeType.FUNCTION_CALL: {
        return this.setAsyncPromiseToProcedureAst(ast)
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
        ast.left = this.checkFunctionPromisesForAst(ast.left, state)
        ast.right = this.checkFunctionPromisesForAst(ast.right, state)

        return ast
      }
      case AstNodeType.MINUS_UNARY_OP:
      case AstNodeType.PLUS_UNARY_OP:
      case AstNodeType.PERCENT_OP: {
        ast.value = this.checkFunctionPromisesForAst(ast.value, state)

        return ast
      }
      case AstNodeType.PARENTHESIS: {
        ast.expression = this.checkFunctionPromisesForAst(ast.expression, state)

        return ast
      }
      case AstNodeType.ARRAY: {
        const newAsts = ast.args.map((row) => {
          return row.map(ast => {
            return this.checkFunctionPromisesForAst(ast, state)
          })
        })

        ast.args = newAsts

        return ast
      }
      default:
        return ast
    }
  }

  public setAsyncPromiseToProcedureAst(ast: ProcedureAst): ProcedureAst {
    const metadata = this.functionRegistry.getMetadata(ast.procedureName)

    if (metadata?.isAsyncMethod) {
      const pluginFunction = this.functionRegistry.getAsyncFunction(ast.procedureName)

      if (pluginFunction !== undefined) {
        const promiseGetter = (state: InterpreterState) => {
          const promise = new Promise<InterpreterValue>((resolve, reject) => {
            const pluginFunctionValue = pluginFunction(newAst, state)
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

        const asyncPromise = new AsyncPromise(promiseGetter, ast.asyncPromise?.chunked ?? {
          isChunked: false,
          chunkedIterator: 0
        })

        const newAst = {
          ...ast,
          asyncPromise
        }
        
        return newAst
      }
    }
    return ast
  }
}

