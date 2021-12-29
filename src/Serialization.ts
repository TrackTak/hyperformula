/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { RawCellContent } from '.'
import {simpleCellAddress, SimpleCellAddress} from './Cell'
import {DataRawCellContent} from './CellContentParser'
import {CellValue} from './CellValue'
import {Config} from './Config'
import {ArrayVertex, CellVertex, DependencyGraph, FormulaCellVertex, ParsingErrorVertex} from './DependencyGraph'
import {Exporter} from './Exporter'
import {CellData, getCellValue} from './interpreter/InterpreterValue'
import {Maybe} from './Maybe'
import {NamedExpressionOptions, NamedExpressions} from './NamedExpressions'
import {buildLexerConfig, Unparser} from './parser'

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
    private readonly exporter: Exporter
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

  public getCellFormula(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): Maybe<string | CellData<string | undefined>> {
    const cell = this.dependencyGraph.getCell(address)

    if (!cell) return undefined

    if (cell instanceof CellData) {
      return {
        cellValue: this.parseCellFormula(cell.cellValue, address, targetAddress),
        metadata: cell.metadata  
      }
    }
 
    return this.parseCellFormula(cell, address, targetAddress)
  }

  public getCellSerialized(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): DataRawCellContent {
    return this.getCellFormula(address, targetAddress) ?? this.getRawValue(address)
  }

  public getCellValue(address: SimpleCellAddress): CellValue | CellData<CellValue> {
    return this.exporter.exportValue(this.dependencyGraph.getScalarValue(address))
  }

  public getRawValue(address: SimpleCellAddress): DataRawCellContent {
    return this.dependencyGraph.getRawValue(address)
  }

  public getSheetValues(sheet: number): (CellValue | CellData<CellValue>)[][] {
    return this.genericSheetGetter(sheet, (arg) => this.getCellValue(arg))
  }

  public getSheetFormulas(sheet: number): Maybe<string | CellData<string | undefined>>[][] {
    return this.genericSheetGetter(sheet, (arg) => this.getCellFormula(arg))
  }

  public genericSheetGetter<T>(sheet: number, getter: (address: SimpleCellAddress) => T): T[][] {
    const sheetHeight = this.dependencyGraph.getSheetHeight(sheet)
    const sheetWidth = this.dependencyGraph.getSheetWidth(sheet)

    const arr: T[][] = new Array(sheetHeight)
    for (let i = 0; i < sheetHeight; i++) {
      arr[i] = new Array(sheetWidth)

      for (let j = 0; j < sheetWidth; j++) {
        const address = simpleCellAddress(sheet, j, i)
        arr[i][j] = getter(address)
      }
      for (let j = sheetWidth - 1; j >= 0; j--) {
        if (arr[i][j] === null || arr[i][j] === undefined) {
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
    return arr
  }

  public genericAllSheetsGetter<T>(sheetGetter: (sheet: number) => T): Record<string, T> {
    const result: Record<string, T> = {}
    for (const sheetName of this.dependencyGraph.sheetMapping.displayNames()) {
      const sheetId = this.dependencyGraph.sheetMapping.fetch(sheetName)
      result[sheetName] = sheetGetter(sheetId)
    }
    return result
  }

  public getSheetSerialized(sheet: number): DataRawCellContent[][] {
    return this.genericSheetGetter(sheet, (arg) => this.getCellSerialized(arg))
  }

  public getAllSheetsValues(): Record<string, (CellValue | CellData<CellValue>)[][]> {
    return this.genericAllSheetsGetter((arg) => this.getSheetValues(arg))
  }

  public getAllSheetsFormulas(): Record<string, Maybe<string | CellData<string | undefined>>[][]> {
    return this.genericAllSheetsGetter((arg) => this.getSheetFormulas(arg))
  }

  public getAllSheetsSerialized(): Record<string, DataRawCellContent[][]> {
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
        expression: getCellValue(this.getCellSerialized(entry.expression.address)),
        scope: entry.scope !== undefined ? idMap[entry.scope] : undefined,
        options: entry.expression.options
      }
    })
  }

  public withNewConfig(newConfig: Config, namedExpressions: NamedExpressions): Serialization {
    const newUnparser = new Unparser(newConfig, buildLexerConfig(newConfig), this.dependencyGraph.sheetMapping.fetchDisplayName, namedExpressions)
    return new Serialization(this.dependencyGraph, newUnparser, this.exporter)
  }
}
