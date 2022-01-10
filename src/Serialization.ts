/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { RawCellContent, Sheet } from '.'
import {simpleCellAddress, SimpleCellAddress} from './Cell'
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

  private parseCellFormula(cellValue: CellVertex, address: SimpleCellAddress, targetAddress?: SimpleCellAddress): Maybe<string> {    
    if (cellValue instanceof FormulaCellVertex) {
      const formula = cellValue.getFormula(this.dependencyGraph.lazilyTransformingAstService)
      targetAddress = targetAddress ?? address
      return this.unparser.unparse(formula, targetAddress)
    } else if (cellValue instanceof ArrayVertex) {
      const arrayVertexAddress = cellValue.getAddress(this.dependencyGraph.lazilyTransformingAstService)
      if (arrayVertexAddress.row !== address.row || arrayVertexAddress.col !== address.col || arrayVertexAddress.sheet !== address.sheet) {
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

    if (!cell || cell instanceof EmptyCellVertex) return new CellData(undefined)

    return new CellData(this.parseCellFormula(cell, address, targetAddress), cell.metadata)
  }

  public getCellSerialized(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): DataRawCellContent {
    const cellFormula = this.getCellFormula(address, targetAddress)

    return cellFormula.cellValue !== undefined ? cellFormula.toRawContent() : this.getRawValue(address)
  }

  public getCellValue(address: SimpleCellAddress): CellData<CellValue> {
    const cell = this.dependencyGraph.getScalarValue(address)

    return this.exporter.exportValue(cell)
  }

  public getRawValue(address: SimpleCellAddress): DataRawCellContent {
    const cell = this.dependencyGraph.getRawValue(address)

    return cell
  }

  public getSheetValues(sheet: number): GenericSheet<CellData<CellValue>> {
    return this.genericSheetGetter(sheet, (arg) => this.getCellValue(arg))
  }

  public getSheetFormulas(sheet: number): GenericSheet<CellData<string | undefined>> {
    return this.genericSheetGetter(sheet, (arg) => this.getCellFormula(arg))
  }

  public genericSheetGetter<T extends CellData<any> | DataRawCellContent>(sheet: number, getter: (address: SimpleCellAddress) => T): GenericSheet<T> {
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet)
    const sheetWidth = this.dependencyGraph.getSheetWidth(sheet)
    const sheetMetadata = this.sheetMapping.fetchSheetById(sheet).sheetMetadata
    const arr: T[][] = new Array(sheetHeight)

    for (let i = 0; i < sheetHeight; i++) {
      arr[i] = new Array(sheetWidth)

      for (let j = 0; j < sheetWidth; j++) {
        const address = simpleCellAddress(sheet, j, i)
        arr[i][j] = getter(address)
      }
      for (let j = sheetWidth - 1; j >= 0; j--) {
        const cell = arr[i][j]

        if ((cell.cellValue === null || cell.cellValue === undefined) && !cell.metadata) {
          arr[i].pop()
        } else {
          break
        }
      }
    }

    for (let i = sheetHeight - 1; i >= 0; i--) {
      if (arr[i].length === 0) {
        arr.pop()
      } else {
        break
      }
    }
    return {
      cells: arr,
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

  public getSheetSerialized(sheet: number): Sheet {
    return this.genericSheetGetter(sheet, (arg) => this.getCellSerialized(arg))
  }

  public getAllSheetsValues(): GenericSheets<CellData<CellValue>> {
    return this.genericAllSheetsGetter((arg) => this.getSheetValues(arg))
  }

  public getAllSheetsFormulas(): GenericSheets<CellData<string | undefined>> {
    return this.genericAllSheetsGetter((arg) => this.getSheetFormulas(arg))
  }

  public getAllSheetsSerialized(): Record<string, Sheet> {
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
