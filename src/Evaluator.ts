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
import {CellError, ErrorType, SimpleCellAddress} from './Cell'
import {Config} from './Config'
import {ContentChanges} from './ContentChanges'
import {ArrayVertex, DependencyGraph, RangeVertex, Vertex} from './DependencyGraph'
import { CachedGraphType } from './DependencyGraph/DependencyGraph'
import {FormulaVertex} from './DependencyGraph/FormulaCellVertex'
import { TopSortResult } from './DependencyGraph/Graph'
import {Interpreter} from './interpreter/Interpreter'
import {InterpreterState} from './interpreter/InterpreterState'
import {EmptyValue, getRawValue, InterpreterValue} from './interpreter/InterpreterValue'
import {SimpleRangeValue} from './interpreter/SimpleRangeValue'
import {LazilyTransformingAstService} from './LazilyTransformingAstService'
import {ColumnSearchStrategy} from './Lookup/SearchStrategy'
import {Ast, RelativeDependency} from './parser'
import { checkAstForAsyncPromises } from './parser/Ast'
import {Statistics, StatType} from './statistics'

export class Evaluator {
  constructor(
    private readonly config: Config,
    private readonly stats: Statistics,
    public readonly interpreter: Interpreter,
    private readonly lazilyTransformingAstService: LazilyTransformingAstService,
    private readonly dependencyGraph: DependencyGraph,
    private readonly columnSearch: ColumnSearchStrategy,
  ) {
  }

  public run(): void {
    this.stats.start(StatType.TOP_SORT)
    const { sorted, cycled } = this.dependencyGraph.topSortWithScc()
    this.stats.end(StatType.TOP_SORT)

    this.stats.measure(StatType.EVALUATION, () => {
      this.recomputeFormulas(cycled, sorted)
    })
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
    
    const newAst = this.dependencyGraph.asyncPromiseFetcher.getNewAstWithFunctionPromises(ast, address)
    const asyncPromises = checkAstForAsyncPromises(newAst)
    const state = new InterpreterState(address, this.config.useArrayArithmetic)
    const ret = this.evaluateAstToCellValue(newAst, state)

    tmpRanges.forEach((rangeVertex) => {
      this.dependencyGraph.rangeMapping.removeRange(rangeVertex)
    })

    if (asyncPromises.length) {
      const promise = new Promise<InterpreterValue>((resolve, reject) => {
        this.startAsyncPromises(asyncPromises, state).then(() => {
          const ret = this.evaluateAstToCellValue(newAst, state)

          resolve(ret)
        }).catch(reject)
      })

      return [ret, promise]
    }

    return [ret]
  }

  public startAsyncPromises(asyncPromises: AsyncPromise[], state: InterpreterState) {
    return Promise.all(asyncPromises.map(asyncPromise => {
      return asyncPromise.startPromise(state).getPromise()
    }))
  }

  public partialRun(vertices: Vertex[]): ContentChanges {
    if (this.dependencyGraph.cachedGraphType === CachedGraphType.NONE) {
      return this.partialRunNonCachedGraph(vertices)
    }

    if (this.dependencyGraph.cachedGraphType === CachedGraphType.MAIN) {
      const cachedTopSortedGraph = this.dependencyGraph.getCachedTopSortedGraph()

      return this.runCachedGraph(cachedTopSortedGraph)
    }

    if (this.dependencyGraph.cachedGraphType === CachedGraphType.SUB_GRAPH) {
      const cachedTopSortedWithSccSubgraph = this.dependencyGraph.getCachedTopSortedWithSccSubgraph()

      if (cachedTopSortedWithSccSubgraph === null) {
        return this.partialRunNonCachedGraph(vertices)
      }

      return this.runCachedGraph(cachedTopSortedWithSccSubgraph)
    }

    throw new Error('unexpected cachedGraphType encountered')
  }

  private runCachedGraph(cachedTopSortGraph: TopSortResult<Vertex> | null): ContentChanges {
    if (cachedTopSortGraph === null) {
      throw new Error('cachedTopSortGraph should not be null')
    }

    const changes = ContentChanges.empty()
    const { sorted, cycled } = cachedTopSortGraph

    this.stats.measure(StatType.EVALUATION, () => {
      sorted.forEach((vertex) => {
        this.operatingFunction(changes, vertex)
      })

      cycled.forEach((vertex) => {
        this.onCycle(changes, vertex)
      })
    })

    return changes
  }

  private partialRunNonCachedGraph(vertices: Vertex[]): ContentChanges {
    const changes = ContentChanges.empty()

    this.stats.measure(StatType.EVALUATION, () => {
      this.dependencyGraph.getTopSortedWithSccSubgraphFrom(vertices,
        (vertex: Vertex) => this.operatingFunction(changes, vertex),
        (vertex: Vertex) => this.onCycle(changes, vertex)
      )
    })

    return changes
  }

  private operatingFunction(changes: ContentChanges, vertex: Vertex): boolean {
    if (vertex instanceof FormulaVertex) {
      const currentValue = vertex.isComputed() ? vertex.getCellValue() : undefined
      const newCellValue = this.recomputeFormulaVertexValue(vertex)

      if (newCellValue !== currentValue) {
        const address = vertex.getAddress(this.lazilyTransformingAstService)
        const currentRawValue = getRawValue(currentValue)
        const newRawValue = getRawValue(newCellValue)

        changes.addChange(newCellValue, address)

        this.columnSearch.change(currentRawValue, newRawValue, address)

        return true
      }
      return false
    } else if (vertex instanceof RangeVertex) {
      vertex.clearCache()
      return true
    }
    return true
  }

  private onCycle(changes: ContentChanges, vertex: Vertex) {
    if (vertex instanceof RangeVertex) {
      vertex.clearCache()
    } else if (vertex instanceof FormulaVertex) {
      const address = vertex.getAddress(this.lazilyTransformingAstService)
      const rawValue = getRawValue(vertex.valueOrUndef())

      this.columnSearch.remove(rawValue, address)
      const error = new CellError(ErrorType.CYCLE, undefined, vertex)
      const value = error

      vertex.setCellValue(value)
      changes.addChange(value, address)
    }
  }

  /**
   * Recalculates formulas in the topological sort order
   */
  private recomputeFormulas(cycled: Vertex[], sorted: Vertex[]): void {
    cycled.forEach((vertex: Vertex) => {
      if (vertex instanceof FormulaVertex) {
        vertex.setCellValue(new CellError(ErrorType.CYCLE, undefined, vertex))
      }
    })

    sorted.forEach((vertex: Vertex) => {
      if (vertex instanceof FormulaVertex) {
        const newCellValue = this.recomputeFormulaVertexValue(vertex)
        const address = vertex.getAddress(this.lazilyTransformingAstService)
        const rawValue = getRawValue(newCellValue)

        this.columnSearch.add(rawValue, address)

      } else if (vertex instanceof RangeVertex) {
        vertex.clearCache()
      }
    })
  }

  private recomputeFormulaVertexValue(vertex: FormulaVertex): InterpreterValue {
    const address = vertex.getAddress(this.lazilyTransformingAstService)

    if (vertex instanceof ArrayVertex && (vertex.array.size.isRef || !this.dependencyGraph.isThereSpaceForArray(vertex))) {
      return vertex.setNoSpace()
    } else {
      if (vertex.hasAsyncPromises() && !vertex.areAsyncPromisesWaitingToBeResolved()) {
        this.dependencyGraph.graph.markAsyncNodeAsSpecialRecentlyChanged(vertex)
      }
      
      const formula = vertex.getFormula(this.lazilyTransformingAstService)
      const newCellValue = this.evaluateAstToCellValue(formula, new InterpreterState(address, this.config.useArrayArithmetic, vertex))
      
      return vertex.setCellValue(newCellValue)
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
