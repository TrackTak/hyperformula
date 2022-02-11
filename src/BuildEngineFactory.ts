/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {ArraySizePredictor} from './ArraySize'
import {AsyncPromiseFetcher} from './AsyncPromise'
import {CellContentParser} from './CellContentParser'
import {ClipboardOperations} from './ClipboardOperations'
import {Config, ConfigParams} from './Config'
import {CrudOperations} from './CrudOperations'
import {DateTimeHelper} from './DateTimeHelper'
import {DependencyGraph} from './DependencyGraph'
import { FormulaVertex } from './DependencyGraph/FormulaCellVertex'
import { Emitter } from './Emitter'
import {SheetSizeLimitExceededError} from './errors'
import {Evaluator} from './Evaluator'
import {Exporter} from './Exporter'
import {GraphBuilder} from './GraphBuilder'
import {UIElement} from './i18n'
import {ArithmeticHelper} from './interpreter/ArithmeticHelper'
import {FunctionRegistry} from './interpreter/FunctionRegistry'
import {Interpreter} from './interpreter/Interpreter'
import {LazilyTransformingAstService} from './LazilyTransformingAstService'
import {buildColumnSearchStrategy, ColumnSearchStrategy} from './Lookup/SearchStrategy'
import {NamedExpressions} from './NamedExpressions'
import {NumberLiteralHelper} from './NumberLiteralHelper'
import {Operations} from './Operations'
import {buildLexerConfig, ParserWithCaching, Unparser} from './parser'
import {Serialization, SerializedNamedExpression} from './Serialization'
import {findBoundaries, InputSheet, InputSheets, validateAsSheet} from './Sheet'
import {EmptyStatistics, Statistics, StatType} from './statistics'
import {UndoRedo} from './UndoRedo'

export type EngineState = {
  config: Config,
  stats: Statistics,
  dependencyGraph: DependencyGraph,
  columnSearch: ColumnSearchStrategy,
  parser: ParserWithCaching,
  unparser: Unparser,
  cellContentParser: CellContentParser,
  evaluator: Evaluator,
  lazilyTransformingAstService: LazilyTransformingAstService,
  crudOperations: CrudOperations,
  exporter: Exporter,
  namedExpressions: NamedExpressions,
  serialization: Serialization,
  functionRegistry: FunctionRegistry,
  asyncPromiseFetcher: AsyncPromiseFetcher,
  eventEmitter: Emitter,
}

export class BuildEngineFactory {
  public static buildFromSheets(sheets: InputSheets<any, any>, configInput: Partial<ConfigParams> = {}, namedExpressions: SerializedNamedExpression[] = []): EngineState {
    const config = new Config(configInput)
    return this.buildEngine(config, sheets, namedExpressions)
  }

  public static buildFromSheet(sheet: InputSheet<any, any>, configInput: Partial<ConfigParams> = {}, namedExpressions: SerializedNamedExpression[] = []): EngineState {
    const config = new Config(configInput)
    const newsheetprefix = config.translationPackage.getUITranslation(UIElement.NEW_SHEET_PREFIX) + '1'
    return this.buildEngine(config, {[newsheetprefix]: sheet}, namedExpressions)
  }

  public static buildEmpty(configInput: Partial<ConfigParams> = {}, namedExpressions: SerializedNamedExpression[] = []): EngineState {
    return this.buildEngine(new Config(configInput), {}, namedExpressions)
  }

  public static rebuildWithConfig(config: Config, sheets: InputSheets<any, any>, namedExpressions: SerializedNamedExpression[], stats: Statistics): EngineState {
    return this.buildEngine(config, sheets, namedExpressions, stats)
  }

  private static buildEngine(config: Config, sheets: InputSheets<any, any> = {}, inputNamedExpressions: SerializedNamedExpression[] = [], stats: Statistics = config.useStats ? new Statistics() : new EmptyStatistics()): EngineState {
    stats.start(StatType.BUILD_ENGINE_TOTAL)

    const eventEmitter = new Emitter()
    const namedExpressions = new NamedExpressions()
    const functionRegistry = new FunctionRegistry(config)
    const asyncPromiseFetcher = new AsyncPromiseFetcher(config, functionRegistry)
    const lazilyTransformingAstService = new LazilyTransformingAstService(stats)
    const dependencyGraph = DependencyGraph.buildEmpty(lazilyTransformingAstService, config, functionRegistry, namedExpressions, stats, asyncPromiseFetcher)
    const columnSearch = buildColumnSearchStrategy(dependencyGraph, config, stats)
    const sheetMapping = dependencyGraph.sheetMapping
    const addressMapping = dependencyGraph.addressMapping

    for (const sheetName in sheets) {
      if (Object.prototype.hasOwnProperty.call(sheets, sheetName)) {
        const sheet = sheets[sheetName]
        validateAsSheet(sheet)
        const boundaries = findBoundaries(sheet.cells)
        if (boundaries.height > config.maxRows || boundaries.width > config.maxColumns) {
          throw new SheetSizeLimitExceededError()
        }
        const sheetId = sheetMapping.addSheet(sheetName, sheet.sheetMetadata)
        addressMapping.autoAddSheet(sheetId, boundaries)
      }
    }

    const parser = new ParserWithCaching(config, functionRegistry, sheetMapping.get)
    lazilyTransformingAstService.parser = parser
    const unparser = new Unparser(config, buildLexerConfig(config), sheetMapping.fetchDisplayName, namedExpressions)
    const dateTimeHelper = new DateTimeHelper(config)
    const numberLiteralHelper = new NumberLiteralHelper(config)
    const arithmeticHelper = new ArithmeticHelper(config, dateTimeHelper, numberLiteralHelper)
    const cellContentParser = new CellContentParser(config, dateTimeHelper, numberLiteralHelper)

    const arraySizePredictor = new ArraySizePredictor(config, functionRegistry)
    const operations = new Operations(config, dependencyGraph, columnSearch, cellContentParser, parser, stats, lazilyTransformingAstService, namedExpressions, arraySizePredictor, asyncPromiseFetcher)
    const undoRedo = new UndoRedo(config, operations, eventEmitter)
    lazilyTransformingAstService.undoRedo = undoRedo
    const clipboardOperations = new ClipboardOperations(config, dependencyGraph, operations)
    const crudOperations = new CrudOperations(config, operations, undoRedo, clipboardOperations, dependencyGraph, columnSearch, parser, cellContentParser, lazilyTransformingAstService, namedExpressions)
    inputNamedExpressions.forEach((entry: SerializedNamedExpression) => {
      crudOperations.ensureItIsPossibleToAddNamedExpression(entry.name, entry.expression, entry.scope)
      crudOperations.operations.addNamedExpression(entry.name, entry.expression, entry.scope, entry.options)
    })

    const exporter = new Exporter(config, namedExpressions, sheetMapping.fetchDisplayName, lazilyTransformingAstService)
    const serialization = new Serialization(dependencyGraph, unparser, exporter, sheetMapping)

    const interpreter = new Interpreter(config, dependencyGraph, columnSearch, stats, arithmeticHelper, functionRegistry, namedExpressions, serialization, arraySizePredictor, dateTimeHelper, cellContentParser)

    stats.measure(StatType.GRAPH_BUILD, () => {
      const graphBuilder = new GraphBuilder(dependencyGraph, columnSearch, parser, cellContentParser, stats, arraySizePredictor, asyncPromiseFetcher)
      graphBuilder.buildGraph(sheets, stats)
    })

    const evaluator = new Evaluator(config, stats, interpreter, lazilyTransformingAstService, dependencyGraph, columnSearch)

    evaluator.run()

    stats.end(StatType.BUILD_ENGINE_TOTAL)

    return {
      config,
      stats,
      dependencyGraph,
      columnSearch,
      parser,
      unparser,
      cellContentParser,
      evaluator,
      lazilyTransformingAstService,
      crudOperations,
      exporter,
      namedExpressions,
      serialization,
      functionRegistry,
      asyncPromiseFetcher,
      eventEmitter
    }
  }
}
