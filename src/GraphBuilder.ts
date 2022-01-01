/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { DataRawCellContent, getCellDataValue } from '.'
import {absolutizeDependencies} from './absolutizeDependencies'
import {ArraySize, ArraySizePredictor} from './ArraySize'
import {AsyncPromiseFetcher} from './AsyncPromise'
import {SimpleCellAddress, simpleCellAddress} from './Cell'
import {CellContent, CellContentParser} from './CellContentParser'
import {CellDependency} from './CellDependency'
import {
  ArrayVertex,
  DependencyGraph,
  FormulaCellVertex,
  ParsingErrorVertex,
  ValueCellVertex,
  Vertex
} from './DependencyGraph'
import {CellData, getRawValue} from './interpreter/InterpreterValue'
import {ColumnSearchStrategy} from './Lookup/SearchStrategy'
import {ParserWithCaching} from './parser'
import {Sheets} from './Sheet'
import {Statistics, StatType} from './statistics'

export type Dependencies = Map<Vertex, CellDependency[]>

/**
 * Service building the graph and mappings.
 */
export class GraphBuilder {
  private buildStrategy: GraphBuilderStrategy

  /**
   * Configures the building service.
   */
  constructor(
    private readonly dependencyGraph: DependencyGraph,
    private readonly columnSearch: ColumnSearchStrategy,
    private readonly parser: ParserWithCaching,
    private readonly cellContentParser: CellContentParser,
    private readonly stats: Statistics,
    private readonly arraySizePredictor: ArraySizePredictor,
    private readonly asyncPromiseFetcher: AsyncPromiseFetcher
  ) {
    this.buildStrategy = new SimpleStrategy(dependencyGraph, columnSearch, parser, stats, cellContentParser, arraySizePredictor, asyncPromiseFetcher)
  }

  /**
   * Builds graph.
   */
  public buildGraph(sheets: Sheets, stats: Statistics) {
    const dependencies = stats.measure(StatType.COLLECT_DEPENDENCIES, () => this.buildStrategy.run(sheets))
    this.dependencyGraph.getAndClearContentChanges()
    stats.measure(StatType.PROCESS_DEPENDENCIES, () => this.processDependencies(dependencies))
  }

  private processDependencies(dependencies: Dependencies) {
    dependencies.forEach((cellPrecedents: CellDependency[], endVertex: Vertex) => {
      this.dependencyGraph.processCellPrecedents(cellPrecedents, endVertex)
    })
  }
}

export interface GraphBuilderStrategy {
  run(sheets: Sheets): Dependencies,
}

export class SimpleStrategy implements GraphBuilderStrategy {
  constructor(
    private readonly dependencyGraph: DependencyGraph,
    private readonly columnIndex: ColumnSearchStrategy,
    private readonly parser: ParserWithCaching,
    private readonly stats: Statistics,
    private readonly cellContentParser: CellContentParser,
    private readonly arraySizePredictor: ArraySizePredictor,
    private readonly asyncPromiseFetcher: AsyncPromiseFetcher
  ) {
  }

  public run(sheets: Sheets): Dependencies {
    const dependencies: Map<Vertex, CellDependency[]> = new Map()

    for (const sheetName in sheets) {
      const sheetId = this.dependencyGraph.getSheetId(sheetName)
      const sheet = sheets[sheetName]

      for (let i = 0; i < sheet.length; ++i) {
        const row = sheet[i]
        for (let j = 0; j < row.length; ++j) {
          const cellContent = row[j]
          const address = simpleCellAddress(sheetId, j, i)
          const parsedCellContent = this.cellContentParser.parse(cellContent)
          const dependency = this.setDependency(address, cellContent, parsedCellContent)

          if (dependency) {
            const [vertex, cellDependency] = dependency

            dependencies.set(vertex, cellDependency)
          }
        }
      }
    }

    return dependencies
  }

  private setDependency(address: SimpleCellAddress, rawCellContent: DataRawCellContent, parsedCellContent: CellData<CellContent.Type>): null | [Vertex, CellDependency[]] {
    const { cellValue, metadata } = parsedCellContent
    
    if (cellValue instanceof CellContent.Formula) {
      const parseResult = this.stats.measure(StatType.PARSER, () => this.parser.parse(cellValue.formula, address))
      if (parseResult.errors.length > 0) {
        this.shrinkArrayIfNeeded(address)
        const vertex = new ParsingErrorVertex(parseResult.errors, cellValue.formula, metadata)

        this.dependencyGraph.addVertex(address, vertex)
      } else {
        this.shrinkArrayIfNeeded(address)

        const asyncPromises = this.asyncPromiseFetcher.checkFunctionPromises(parseResult.ast, address)
        const size = this.arraySizePredictor.checkArraySize(parseResult.ast, address)

        if (size.isScalar()) {
          const vertex = new FormulaCellVertex(parseResult.ast, address, 0, asyncPromises, metadata)

          this.dependencyGraph.addVertex(address, vertex)

          if (parseResult.hasVolatileFunction) {
            this.dependencyGraph.markAsVolatile(vertex)
          }
          if (parseResult.hasStructuralChangeFunction) {
            this.dependencyGraph.markAsDependentOnStructureChange(vertex)
          }
          if (parseResult.hasAsyncFunction) {
            this.dependencyGraph.markAsAsync(vertex)
          }

          return [vertex, absolutizeDependencies(parseResult.dependencies, address)]
        } else {
          const vertex = new ArrayVertex(parseResult.ast, address, new ArraySize(size.width, size.height), asyncPromises, metadata)

          this.dependencyGraph.addArrayVertex(address, vertex)

          if (parseResult.hasAsyncFunction) {
            this.dependencyGraph.markAsAsync(vertex)
          }

          return [vertex, absolutizeDependencies(parseResult.dependencies, address)]
        }
      }
    } else if (cellValue instanceof CellContent.Empty) {
      return null
    } else {
      this.shrinkArrayIfNeeded(address)
      const vertex = new ValueCellVertex(cellValue.value, getCellDataValue(rawCellContent), metadata)

      this.columnIndex.add(getRawValue(cellValue.value), address)
      this.dependencyGraph.addVertex(address, vertex)
    }
    return null
  }

  private shrinkArrayIfNeeded(address: SimpleCellAddress) {
    const vertex = this.dependencyGraph.getCell(address)
    if (vertex instanceof ArrayVertex) {
      this.dependencyGraph.shrinkArrayToCorner(vertex)
    }
  }
}
