/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { RawCellContent } from '.'
import {SimpleCellAddress} from './Cell'
import {DataRawCellContent} from './CellContentParser'
import {CellValue} from './CellValue'
import {Config} from './Config'
import {ArrayVertex, CellVertex, DependencyGraph, EmptyCellVertex, FormulaCellVertex, ParsingErrorVertex, SheetMapping} from './DependencyGraph'
import {Exporter} from './Exporter'
import {CellData} from './interpreter/InterpreterValue'
import {Maybe} from './Maybe'
import {NamedExpressionOptions, NamedExpressions} from './NamedExpressions'
import {buildLexerConfig, Unparser} from './parser'
import { GenericSheet, GenericSheets } from './Sheet'

export interface SerializedNamedExpression {
  name: string,
  expression: RawCellContent,
  scope?: number,
  options?: NamedExpressionOptions,
}

export class Serialization {
  constructor(
    private readonly dependencyGraph: DependencyGraph,
    private readonly unparser: Unparser,
    private readonly exporter: Exporter,
    private readonly sheetMapping: SheetMapping
  ) {
  }

  private isArrayVertexPartOfArray(cellValue: ArrayVertex, address: SimpleCellAddress) {
    const arrayVertexAddress = cellValue.getAddress(this.dependencyGraph.lazilyTransformingAstService)
    
    if (arrayVertexAddress.row !== address.row || arrayVertexAddress.col !== address.col || arrayVertexAddress.sheet !== address.sheet) {
      return true
    }

    return false
  }

  private parseCellFormula(cellValue: CellVertex, address: SimpleCellAddress, targetAddress?: SimpleCellAddress): Maybe<string> {    
    if (cellValue instanceof FormulaCellVertex) {
      const formula = cellValue.getFormula(this.dependencyGraph.lazilyTransformingAstService)
      targetAddress = targetAddress ?? address
      return this.unparser.unparse(formula, targetAddress)
    } else if (cellValue instanceof ArrayVertex) {
      if (this.isArrayVertexPartOfArray(cellValue, address)) {
        return undefined
      }
      targetAddress = targetAddress ?? address
      const formula = cellValue.getFormula(this.dependencyGraph.lazilyTransformingAstService)
      if (formula !== undefined) {
        return this.unparser.unparse(formula, targetAddress)
      }
    } else if (cellValue instanceof ParsingErrorVertex) {
      return cellValue.getFormula()
    }
    return undefined
  }

  public getCellFormula(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): CellData<string | undefined> {
    const cell = this.dependencyGraph.getCell(address)
    const cellMetadata = this.dependencyGraph.getCellMetadata(address)

    if (!cell || cell instanceof EmptyCellVertex) {
      return new CellData(undefined, cellMetadata)
    }

    return new CellData(this.parseCellFormula(cell, address, targetAddress), cellMetadata)
  }

  public getCellSerialized(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): DataRawCellContent {
    const cellFormula = this.getCellFormula(address, targetAddress)

    return cellFormula.cellValue === undefined ? this.getRawValue(address) : cellFormula
  }

  public getCellValue(address: SimpleCellAddress): CellData<CellValue> {
    const cell = this.dependencyGraph.getScalarValue(address)

    return new CellData(this.exporter.exportValue(cell.cellValue), cell.metadata)
  }

  public getRawValue(address: SimpleCellAddress): DataRawCellContent {
    const cellVertex = this.dependencyGraph.getCell(address)

    if (cellVertex instanceof ArrayVertex) {
      if (this.isArrayVertexPartOfArray(cellVertex, address)) {
        const metadata = this.dependencyGraph.getCellMetadata(address)

        return {
          cellValue: undefined,
          metadata
        }
      }
    }

    const cell = this.dependencyGraph.getRawValue(address)

    return cell
  }

  public getSheetValues(sheet: number): GenericSheet<Maybe<CellData<CellValue>>, Maybe<any>> {
    return this.genericSheetGetter(sheet, (arg) => this.getCellValue(arg))
  }

  public getSheetFormulas(sheet: number): GenericSheet<Maybe<CellData<string | undefined>>, Maybe<any>> {
    return this.genericSheetGetter(sheet, (arg) => this.getCellFormula(arg))
  }

  public genericSheetGetter<T extends CellData<any> | DataRawCellContent>(sheet: number, getter: (address: SimpleCellAddress) => T): GenericSheet<T, any> {
    const entries = this.dependencyGraph.getSheetEntries(sheet)
    const sheetMetadata = this.sheetMapping.fetchSheetById(sheet).sheetMetadata
    const cells: T[][] = []

    for (const [address] of entries) {
      const cell = getter(address)
      const { row, col } = address

      if ((cell.cellValue !== undefined && cell.cellValue !== null) || cell.metadata) {
        if (!cells[row]) {
          cells[row] = []
        }

        cells[row][col] = cell
      }
    }

    return {
      cells,
      sheetMetadata
    }
  }

  public genericAllSheetsGetter<T>(sheetGetter: (sheet: number) => T): Record<string, T> {
    const result: Record<string, T> = {}
    for (const sheetName of this.dependencyGraph.sheetMapping.displayNames()) {
      const sheetId = this.dependencyGraph.sheetMapping.fetch(sheetName)
      result[sheetName] = sheetGetter(sheetId)
    }
    return result
  }

  public getSheetSerialized(sheet: number): GenericSheet<Maybe<DataRawCellContent>, Maybe<any>> {
    return this.genericSheetGetter(sheet, (arg) => this.getCellSerialized(arg))
  }

  public getAllSheetsValues(): GenericSheets<Maybe<CellData<CellValue>>, Maybe<any>> {
    return this.genericAllSheetsGetter((arg) => this.getSheetValues(arg))
  }

  public getAllSheetsFormulas(): GenericSheets<Maybe<CellData<string | undefined>>, Maybe<any>> {
    return this.genericAllSheetsGetter((arg) => this.getSheetFormulas(arg))
  }

  public getAllSheetsSerialized(): Record<string, GenericSheet<Maybe<DataRawCellContent>, Maybe<any>>> {
    return this.genericAllSheetsGetter((arg) => this.getSheetSerialized(arg))
  }

  public getAllNamedExpressionsSerialized(): SerializedNamedExpression[] {
    const idMap: number[] = []
    let id = 0
    for (const sheetName of this.dependencyGraph.sheetMapping.displayNames()) {
      const sheetId = this.dependencyGraph.sheetMapping.fetch(sheetName)
      idMap[sheetId] = id
      id++
    }
    return this.dependencyGraph.namedExpressions.getAllNamedExpressions().map((entry) => {
      return {
        name: entry.expression.displayName,
        expression: this.getCellSerialized(entry.expression.address).cellValue,
        scope: entry.scope !== undefined ? idMap[entry.scope] : undefined,
        options: entry.expression.options
      }
    })
  }

  public withNewConfig(newConfig: Config, namedExpressions: NamedExpressions): Serialization {
    const newUnparser = new Unparser(newConfig, buildLexerConfig(newConfig), this.dependencyGraph.sheetMapping.fetchDisplayName, namedExpressions)
    return new Serialization(this.dependencyGraph, newUnparser, this.exporter, this.sheetMapping)
  }
}
