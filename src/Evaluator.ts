/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

/* eslint-disable @typescript-eslint/ban-ts-ignore */
/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {AbsoluteCellRange} from './AbsoluteCellRange'
import {absolutizeDependencies} from './absolutizeDependencies'
import { AsyncPromise } from './AsyncPromise'
import {CanceledPromise, CellError, ErrorType, SimpleCellAddress} from './Cell'
import {Config} from './Config'
import {ContentChanges} from './ContentChanges'
import {ArrayVertex, DependencyGraph, RangeVertex, Vertex} from './DependencyGraph'
import {FormulaVertex} from './DependencyGraph/FormulaCellVertex'
import {Interpreter} from './interpreter/Interpreter'
import {InterpreterState} from './interpreter/InterpreterState'
import {CellData, DataInterpreterValue, EmptyValue, getRawValue, InterpreterValue} from './interpreter/InterpreterValue'
import {SimpleRangeValue} from './interpreter/SimpleRangeValue'
import {LazilyTransformingAstService} from './LazilyTransformingAstService'
import {ColumnSearchStrategy} from './Lookup/SearchStrategy'
import {Operations} from './Operations'
import {Ast, AstNodeType, RelativeDependency} from './parser'
import {Statistics, StatType} from './statistics'

interface AsyncVertexValues {
  vertex: FormulaVertex,
  values: (InterpreterValue | CanceledPromise<InterpreterValue>)[],
}

export class Evaluator {
  constructor(
    private readonly config: Config,
    private readonly stats: Statistics,
    public readonly interpreter: Interpreter,
    private readonly lazilyTransformingAstService: LazilyTransformingAstService,
    private readonly dependencyGraph: DependencyGraph,
    private readonly columnSearch: ColumnSearchStrategy,
    private readonly operations: Operations,
  ) {
  }

  public run(): Promise<ContentChanges> {
    this.stats.start(StatType.TOP_SORT)
    const {sorted, cycled} = this.dependencyGraph.topSortWithScc()
    this.stats.end(StatType.TOP_SORT)

    return this.stats.measure(StatType.EVALUATION, () => {
      return this.recomputeFormulas(cycled, sorted)
    })
  }

  private startAsyncPromises(asyncPromises: AsyncPromise[], state: InterpreterState) {
    return Promise.all(asyncPromises.map(x => {
      return x.startPromise(state).getPromise()
    }))
  }

  private async recomputeAsyncFunctions(asyncPromiseVertices: FormulaVertex[]): Promise<ContentChanges> {
    const changes = ContentChanges.empty()

    if (!asyncPromiseVertices.length) {
      return changes
    }

    const asyncGroupedVertices = this.dependencyGraph.getAsyncGroupedVertices(asyncPromiseVertices)

    for (const asyncGroupedVerticesRow of asyncGroupedVertices) {
      const asyncVertexValues = await new Promise<AsyncVertexValues[]>((resolve, reject) => {
        const promises = asyncGroupedVerticesRow.map((vertex) => {
          const promise = this.startAsyncPromises(vertex.getAsyncPromises(), 
            new InterpreterState(
              vertex.getAddress(this.lazilyTransformingAstService),
              this.config.useArrayArithmetic,
              vertex
            )
          )

          return new Promise<AsyncVertexValues>((resolve, reject) => {
            promise.then(values => {
              resolve({
                values,
                vertex
              })
            }).catch(reject)
          })
        })

        Promise.all(promises).then(resolve).catch(reject)
      })

      for (const { vertex, values } of asyncVertexValues) {
        const address = vertex.getAddress(this.lazilyTransformingAstService)
        const ast = vertex.getFormula(this.lazilyTransformingAstService)
        const currentValue = vertex.isComputed() ? vertex.getCellValue() : undefined
        const promisesAreCanceled = values.some(value => value instanceof CanceledPromise)

        if (promisesAreCanceled) {
          continue
        } 

        this.operations.setAsyncFormulaToCell(address, ast)

        const newVertex = this.dependencyGraph.getCell(address) as FormulaVertex

        this.recomputeFormulaVertexValue(newVertex, false)

        const newCellValue = newVertex.getCellValue()
        const currentRawValue = getRawValue(currentValue?.cellValue)
        const newRawValue = getRawValue(newCellValue.cellValue)

        changes.addChange(newCellValue, address)

        this.columnSearch.change(currentRawValue, newRawValue, address)
      }
    }

    // TODO: Don't recompute cancelled vertices
    const verticesToRecomputeFrom = Array.from(this.dependencyGraph.verticesToRecompute())
    const [contentChanges] = this.partialRun(verticesToRecomputeFrom, false)

    changes.addAll(contentChanges)

    return changes
  }

  public partialRun(vertices: Vertex[], recalculateAsyncPromises = true): [ContentChanges, Vertex[], Promise<ContentChanges>] {
    const changes = ContentChanges.empty()
    const asyncVertices: FormulaVertex[] = []

    const { sorted } = this.stats.measure(StatType.EVALUATION, () => {
      return this.dependencyGraph.graph.getTopSortedWithSccSubgraphFrom(vertices,
        (vertex: Vertex) => {
          if (vertex instanceof FormulaVertex) {
            const currentValue = vertex.isComputed() ? vertex.getCellValue() : undefined
            const newCellValue = this.recomputeFormulaVertexValue(vertex, recalculateAsyncPromises)

            if (vertex.hasAsyncPromisesPending()) {
              asyncVertices.push(vertex)
            }

            if (newCellValue.cellValue !== currentValue?.cellValue) {
              const address = vertex.getAddress(this.lazilyTransformingAstService)
              const currentRawValue = getRawValue(currentValue?.cellValue)
              const newRawValue = getRawValue(newCellValue.cellValue)

              changes.addChange(newCellValue, address)

              this.columnSearch.change(currentRawValue, newRawValue, address)
              return true
            }
            return false
          } else if (vertex instanceof RangeVertex) {
            vertex.clearCache()
            return true
          } else {
            return true
          }
        },
        (vertex: Vertex) => {
          if (vertex instanceof RangeVertex) {
            vertex.clearCache()
          } else if (vertex instanceof FormulaVertex) {
            const address = vertex.getAddress(this.lazilyTransformingAstService)
            const rawValue = getRawValue(vertex.valueOrUndef()?.cellValue)

            this.columnSearch.remove(rawValue, address)
            const error = new CellError(ErrorType.CYCLE, undefined, vertex)
            const value = new CellData(error, vertex.metadata)

            vertex.setCellValue(value)
            changes.addChange(value, address)
          }
        },
      )
    })

    return [changes, sorted, this.recomputeAsyncFunctions(asyncVertices)]
  }

  public runAndForget(ast: Ast, address: SimpleCellAddress, dependencies: RelativeDependency[]): [InterpreterValue, Promise<InterpreterValue>?] {
    const tmpRanges: RangeVertex[] = []
    for (const dep of absolutizeDependencies(dependencies, address)) {
      if (dep instanceof AbsoluteCellRange) {
        const range = dep
        if (this.dependencyGraph.getRange(range.start, range.end) === undefined) {
          const rangeVertex = new RangeVertex(range)
          this.dependencyGraph.rangeMapping.setRange(rangeVertex)
          tmpRanges.push(rangeVertex)
        }
      }
    }
    
    this.dependencyGraph.asyncPromiseFetcher.checkFunctionPromises(ast, address)
    
    const state = new InterpreterState(address, this.config.useArrayArithmetic)
    const ret = this.evaluateAstToCellValue(ast, state)

    tmpRanges.forEach((rangeVertex) => {
      this.dependencyGraph.rangeMapping.removeRange(rangeVertex)
    })

    if (ast.type === AstNodeType.FUNCTION_CALL && ast.asyncPromise) {
      const asyncPromise = ast.asyncPromise

      const promise = new Promise<InterpreterValue>((resolve, reject) => {
        this.startAsyncPromises([asyncPromise], state).then(([value]) => {
          resolve(value instanceof CanceledPromise ? value.value : value)
        }).catch(reject)
      })

      return [ret, promise]
    }

    return [ret]
  }

  /**
   * Recalculates formulas in the topological sort order
   */
  private recomputeFormulas(cycled: Vertex[], sorted: Vertex[]): Promise<ContentChanges> {
    cycled.forEach((vertex: Vertex) => {
      if (vertex instanceof FormulaVertex) {
        vertex.setCellValue(new CellData(new CellError(ErrorType.CYCLE, undefined, vertex), vertex.metadata))
      }
    })

    const asyncVertices: FormulaVertex[] = []

    sorted.forEach((vertex: Vertex) => {
      if (vertex instanceof FormulaVertex) {
        const newCellValue = this.recomputeFormulaVertexValue(vertex, true)
        const address = vertex.getAddress(this.lazilyTransformingAstService)
        const rawValue = getRawValue(newCellValue.cellValue)

        this.columnSearch.add(rawValue, address)

        if (vertex.hasAsyncPromisesPending()) {
          asyncVertices.push(vertex)
        }

      } else if (vertex instanceof RangeVertex) {
        vertex.clearCache()
      }
    })

    return this.recomputeAsyncFunctions(asyncVertices)
  }

  private recomputeFormulaVertexValue(vertex: FormulaVertex, recalculateAsyncPromises: boolean): DataInterpreterValue {
    const address = vertex.getAddress(this.lazilyTransformingAstService)
    if (vertex instanceof ArrayVertex && (vertex.array.size.isRef || !this.dependencyGraph.isThereSpaceForArray(vertex))) {
      return vertex.setNoSpace()
    } else {
      if (recalculateAsyncPromises) {
        vertex.recalculateAsyncPromisesWhenNeeded()
      }
      
      const formula = vertex.getFormula(this.lazilyTransformingAstService)
      const newCellValue = this.evaluateAstToCellValue(formula, new InterpreterState(address, this.config.useArrayArithmetic, vertex))
      
      return vertex.setCellValue(new CellData(newCellValue, vertex.metadata))
    }
  }

  private evaluateAstToCellValue(ast: Ast, state: InterpreterState): InterpreterValue {
    const interpreterValue = this.interpreter.evaluateAst(ast, state)

    if (interpreterValue instanceof SimpleRangeValue) {
      return interpreterValue
    } else if (interpreterValue === EmptyValue && this.config.evaluateNullToZero) {
      return 0
    } else {
      return interpreterValue
    }
  }
}
