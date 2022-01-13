/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {SheetCellAddress, simpleCellAddress, SimpleCellAddress} from '../../Cell'
import { CellMetadata } from '../../interpreter/InterpreterValue'
import {Maybe} from '../../Maybe'
import {ColumnsSpan, RowsSpan} from '../../Span'
import {CellVertex} from '../Vertex'
import {IAddressMappingStrategy} from './IAddressMappingStrategy'

/**
 * Mapping from cell addresses to vertices
 *
 * Uses Map to store addresses, having minimal memory usage for sparse sheets but not necessarily constant set/lookup.
 */
export class SparseStrategy implements IAddressMappingStrategy {
  /**
   * Map of Maps in which actual data is stored.
   *
   * Key of map in first level is column number.
   * Key of map in second level is row number.
   */
  private mapping: Map<number, Map<number, CellVertex>> = new Map()
  private metadataMapping: Map<number, Map<number, CellMetadata>> = new Map()

  constructor(private width: number, private height: number) {
  }

  /** @inheritDoc */
  public getCell(address: SheetCellAddress): Maybe<CellVertex> {
    const cell = this.mapping.get(address.col)?.get(address.row)

    return cell
  }

  /** @inheritDoc */
  public getCellMetadata(address: SheetCellAddress): CellMetadata {
    const metadata = this.metadataMapping.get(address.col)?.get(address.row)

    return metadata
  }

  /** @inheritDoc */
  public setCell(address: SheetCellAddress, newVertex: CellVertex) {
    this.width = Math.max(this.width, address.col + 1)
    this.height = Math.max(this.height, address.row + 1)

    let colCellMapping = this.mapping.get(address.col)

    if (!colCellMapping) {
      colCellMapping = new Map()

      this.mapping.set(address.col, colCellMapping)
    }

    colCellMapping.set(address.row, newVertex)
  }

  /** @inheritDoc */
  public setCellMetadata(address: SheetCellAddress, cellMetadata: CellMetadata) {
    if (cellMetadata === undefined) {
      return
    }

    this.width = Math.max(this.width, address.col + 1)
    this.height = Math.max(this.height, address.row + 1)

    let colCellMapping = this.metadataMapping.get(address.col)

    if (!colCellMapping) {
      colCellMapping = new Map()

      this.metadataMapping.set(address.col, colCellMapping)
    }
    colCellMapping.set(address.row, cellMetadata)
  }

  /** @inheritDoc */
  public has(address: SheetCellAddress): boolean {
    return !!this.mapping.get(address.col)?.get(address.row)
  }

  /** @inheritDoc */
  public hasMetadata(address: SheetCellAddress): boolean {
    return !!this.metadataMapping.get(address.col)?.get(address.row)
  }

  /** @inheritDoc */
  public getHeight(): number {
    return this.height
  }

  /** @inheritDoc */
  public getWidth(): number {
    return this.width
  }

  public removeCell(address: SimpleCellAddress): void {
    this.mapping.get(address.col)?.delete(address.row)
  }

  public removeCellMetadata(address: SimpleCellAddress): void {
    this.metadataMapping.get(address.col)?.delete(address.row)
  }

  public addRows(row: number, numberOfRows: number): void {
    this.modifyMappings((mapping) => {
      mapping.forEach((rowMapping) => {
        const tmpMapping = new Map<number, CellVertex | CellMetadata>()

        rowMapping.forEach((value, rowNumber) => {
          if (rowNumber >= row) {
            tmpMapping.set(rowNumber + numberOfRows, value)
            rowMapping.delete(rowNumber)
          }
        })
        tmpMapping.forEach((value, rowNumber) => {
          rowMapping.set(rowNumber, value)
        })
      })
    })
    this.height += numberOfRows
  }

  public addColumns(column: number, numberOfColumns: number): void {
    this.modifyMappings((mapping) => {
      const tmpMapping = new Map<number, Map<number, CellVertex | CellMetadata>>()

      mapping.forEach((rowMapping, colNumber) => {
        if (colNumber >= column) {
          tmpMapping.set(colNumber + numberOfColumns, rowMapping)
          mapping.delete(colNumber)
        }
      })
      tmpMapping.forEach((rowMapping, colNumber) => {
        mapping.set(colNumber, rowMapping)
      })
    })

    this.width += numberOfColumns
  }

  public removeRows(removedRows: RowsSpan): void {
    this.modifyMappings((mapping) => {
      mapping.forEach((rowMapping) => {
        const tmpMapping = new Map<number, CellVertex | CellMetadata>()

        rowMapping.forEach((value, rowNumber) => {
          if (rowNumber >= removedRows.rowStart) {
            rowMapping.delete(rowNumber)
            if (rowNumber > removedRows.rowEnd) {
              tmpMapping.set(rowNumber - removedRows.numberOfRows, value)
            }
          }
        })
        tmpMapping.forEach((value, rowNumber) => {
          rowMapping.set(rowNumber, value)
        })
      })  
    })
    const rightmostRowRemoved = Math.min(this.height - 1, removedRows.rowEnd)
    const numberOfRowsRemoved = Math.max(0, rightmostRowRemoved - removedRows.rowStart + 1)
    this.height = Math.max(0, this.height - numberOfRowsRemoved)
  }

  public removeColumns(removedColumns: ColumnsSpan): void {
    this.modifyMappings((mapping) => {
      const tmpMapping = new Map<number, Map<number, CellVertex | CellMetadata>>()

      mapping.forEach((rowMapping, colNumber) => {
        if (colNumber >= removedColumns.columnStart) {
          mapping.delete(colNumber)
          if (colNumber > removedColumns.columnEnd) {
            tmpMapping.set(colNumber - removedColumns.numberOfColumns, rowMapping)
          }
        }
      })
      tmpMapping.forEach((rowMapping, colNumber) => {
        mapping.set(colNumber, rowMapping)
      })
    })
    
    const rightmostColumnRemoved = Math.min(this.width - 1, removedColumns.columnEnd)
    const numberOfColumnsRemoved = Math.max(0, rightmostColumnRemoved - removedColumns.columnStart + 1)
    this.width = Math.max(0, this.width - numberOfColumnsRemoved)
  }

  public* getEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertex]> {
    for (const [colNumber, col] of this.mapping) {
      for (const [rowNumber, value] of col) {
        yield [simpleCellAddress(sheet, colNumber, rowNumber), value]
      }
    }
  }

  public* verticesFromColumn(column: number): IterableIterator<CellVertex> {
    const colMapping = this.mapping.get(column)
    if (colMapping === undefined) {
      return
    }
    for (const [_, vertex] of colMapping) {
      yield vertex
    }
  }

  public* verticesFromRow(row: number): IterableIterator<CellVertex> {
    for (const colMapping of this.mapping.values()) {
      const rowVertex = colMapping.get(row)
      if (rowVertex !== undefined) {
        yield rowVertex
      }
    }
  }

  public* verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex> {
    for (const column of columnsSpan.columns()) {
      const colMapping = this.mapping.get(column)
      if (colMapping === undefined) {
        continue
      }
      for (const [_, vertex] of colMapping) {
        yield vertex
      }
    }
  }

  public* verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex> {
    for (const colMapping of this.mapping.values()) {
      for (const row of rowsSpan.rows()) {
        const rowVertex = colMapping.get(row)
        if (rowVertex !== undefined) {
          yield rowVertex
        }
      }
    }
  }

  public* entriesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<[SimpleCellAddress, CellVertex]> {
    for (const [col, colMapping] of this.mapping.entries()) {
      for (const row of rowsSpan.rows()) {
        const rowVertex = colMapping.get(row)
        if (rowVertex !== undefined) {
          yield [simpleCellAddress(rowsSpan.sheet, col, row), rowVertex]
        }
      }
    }
  }

  public* entriesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<[SimpleCellAddress, CellVertex]> {
    for (const col of columnsSpan.columns()) {
      const colMapping = this.mapping.get(col)
      if (colMapping !== undefined) {
        for (const [row, vertex] of colMapping.entries()) {
          yield [simpleCellAddress(columnsSpan.sheet, col, row), vertex]
        }
      }
    }
  }

  public* vertices(): IterableIterator<CellVertex> {
    for (const [_, col] of this.mapping) {
      for (const [_, value] of col) {
        if (value !== undefined) {
          yield value
        }
      }
    }
  }

  private modifyMappings(callback: (mapping: Map<number, Map<number, CellVertex | CellMetadata>>) => void) {
    callback(this.mapping)
    callback(this.metadataMapping)
  }
}
