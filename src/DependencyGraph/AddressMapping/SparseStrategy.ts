/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {SheetCellAddress, simpleCellAddress, SimpleCellAddress} from '../../Cell'
import {Maybe} from '../../Maybe'
import {ColumnsSpan, RowsSpan} from '../../Span'
import {CellVertex, CellVertexMetadata} from '../Vertex'
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
  private mapping: Map<number, Map<number, CellVertexMetadata>> = new Map()

  constructor(private width: number, private height: number) {
  }

  /** @inheritDoc */
  public get(address: SheetCellAddress): Maybe<CellVertexMetadata> {
    const cell = this.mapping.get(address.col)?.get(address.row)

    return cell
  }

  /** @inheritDoc */
  public set(address: SheetCellAddress, newVertexMetadata: CellVertexMetadata) {
    this.width = Math.max(this.width, address.col + 1)
    this.height = Math.max(this.height, address.row + 1)

    let colMapping = this.mapping.get(address.col)

    if (!colMapping) {
      colMapping = new Map()

      this.mapping.set(address.col, colMapping)
    }

    colMapping.set(address.row, newVertexMetadata)
  }

  /** @inheritDoc */
  public has(address: SheetCellAddress): boolean {
    return !!this.mapping.get(address.col)?.get(address.row)
  }

  /** @inheritDoc */
  public getHeight(): number {
    return this.height
  }

  /** @inheritDoc */
  public getWidth(): number {
    return this.width
  }

  public remove(address: SimpleCellAddress): void {
    this.mapping.get(address.col)?.delete(address.row)
  }

  public addRows(row: number, numberOfRows: number): void {
    this.mapping.forEach((rowMapping) => {
      const tmpMapping = new Map<number, CellVertexMetadata>()

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
    this.height += numberOfRows
  }

  public addColumns(column: number, numberOfColumns: number): void {
    const tmpMapping = new Map<number, Map<number, CellVertexMetadata>>()

    this.mapping.forEach((rowMapping, colNumber) => {
      if (colNumber >= column) {
        tmpMapping.set(colNumber + numberOfColumns, rowMapping)
        this.mapping.delete(colNumber)
      }
    })
    tmpMapping.forEach((rowMapping, colNumber) => {
      this.mapping.set(colNumber, rowMapping)
    })

    this.width += numberOfColumns
  }

  public removeRows(removedRows: RowsSpan): void {
    this.mapping.forEach((rowMapping) => {
      const tmpMapping = new Map<number, CellVertexMetadata>()

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

    const rightmostRowRemoved = Math.min(this.height - 1, removedRows.rowEnd)
    const numberOfRowsRemoved = Math.max(0, rightmostRowRemoved - removedRows.rowStart + 1)
    this.height = Math.max(0, this.height - numberOfRowsRemoved)
  }

  public removeColumns(removedColumns: ColumnsSpan): void {
    const tmpMapping = new Map<number, Map<number, CellVertexMetadata>>()

    this.mapping.forEach((rowMapping, colNumber) => {
      if (colNumber >= removedColumns.columnStart) {
        this.mapping.delete(colNumber)
        if (colNumber > removedColumns.columnEnd) {
          tmpMapping.set(colNumber - removedColumns.numberOfColumns, rowMapping)
        }
      }
    })

    tmpMapping.forEach((rowMapping, colNumber) => {
      this.mapping.set(colNumber, rowMapping)
    })
    
    const rightmostColumnRemoved = Math.min(this.width - 1, removedColumns.columnEnd)
    const numberOfColumnsRemoved = Math.max(0, rightmostColumnRemoved - removedColumns.columnStart + 1)
    this.width = Math.max(0, this.width - numberOfColumnsRemoved)
  }

  public* getEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
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
    for (const [_, {vertex}] of colMapping) {
      if (vertex !== undefined) {
        yield vertex
      }
    }
  }

  public* verticesFromRow(row: number): IterableIterator<CellVertex> {
    for (const colMapping of this.mapping.values()) {
      const rowVertex = colMapping.get(row)
      if (rowVertex?.vertex !== undefined) {
        yield rowVertex.vertex
      }
    }
  }

  public* verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex> {
    for (const column of columnsSpan.columns()) {
      const colMapping = this.mapping.get(column)
      if (colMapping === undefined) {
        continue
      }
      for (const [_, {vertex}] of colMapping) {
        if (vertex !== undefined) {
          yield vertex
        }
      }
    }
  }

  public* verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex> {
    for (const colMapping of this.mapping.values()) {
      for (const row of rowsSpan.rows()) {
        const rowVertex = colMapping.get(row)
        if (rowVertex?.vertex !== undefined) {
          yield rowVertex.vertex
        }
      }
    }
  }

  public* entriesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
    for (const [col, colMapping] of this.mapping.entries()) {
      for (const row of rowsSpan.rows()) {
        const cellVertex = colMapping.get(row)
        if (cellVertex !== undefined) {
          yield [simpleCellAddress(rowsSpan.sheet, col, row), cellVertex]
        }
      }
    }
  }

  public* entriesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
    for (const col of columnsSpan.columns()) {
      const colMapping = this.mapping.get(col)
      if (colMapping !== undefined) {
        for (const [row, cellVertex] of colMapping.entries()) {
          yield [simpleCellAddress(columnsSpan.sheet, col, row), cellVertex]
        }
      }
    }
  }

  public* vertices(): IterableIterator<CellVertex> {
    for (const [_, col] of this.mapping) {
      for (const [_, value] of col) {
        if (value?.vertex !== undefined) {
          yield value.vertex
        }
      }
    }
  }
}
