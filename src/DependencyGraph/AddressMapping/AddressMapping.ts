/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {SimpleCellAddress} from '../../Cell'
import {DataRawCellContent} from '../../CellContentParser'
import {NoSheetWithIdError} from '../../errors'
import {CellData, CellMetadata, DataInterpreterValue, EmptyValue} from '../../interpreter/InterpreterValue'
import {Maybe} from '../../Maybe'
import {SheetBoundaries} from '../../Sheet'
import {ColumnsSpan, RowsSpan} from '../../Span'
import {ArrayVertex, ValueCellVertex} from '../index'
import {CellVertex, CellVertexMetadata} from '../Vertex'
import {ChooseAddressMapping} from './ChooseAddressMappingPolicy'
import {IAddressMappingStrategy} from './IAddressMappingStrategy'

export class AddressMapping {
  private mapping: Map<number, IAddressMappingStrategy> = new Map()

  constructor(
    private readonly policy: ChooseAddressMapping
  ) {
  }

  /** @inheritDoc */
  public getCell(address: SimpleCellAddress): Maybe<CellVertex> {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet)
    }
    return sheetMapping.get(address)?.vertex
  }

  /** @inheritDoc */
  public getCellMetadata(address: SimpleCellAddress): CellMetadata {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet)
    }
    return sheetMapping.get(address)?.metadata
  }

  public fetchCell(address: SimpleCellAddress): CellVertex {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(address.sheet)
    }
    const cellVertex = sheetMapping.get(address)
    if (!cellVertex?.vertex) {
      throw Error('Cell Vertex for address missing in AddressMapping')
    }
    return cellVertex.vertex
  }

  public strategyFor(sheetId: number): IAddressMappingStrategy {
    const strategy = this.mapping.get(sheetId)
    if (strategy === undefined) {
      throw new NoSheetWithIdError(sheetId)
    }

    return strategy
  }

  public addSheet(sheetId: number, strategy: IAddressMappingStrategy) {
    if (this.mapping.has(sheetId)) {
      throw Error('Sheet already added')
    }

    this.mapping.set(sheetId, strategy)
  }

  public autoAddSheet(sheetId: number, sheetBoundaries: SheetBoundaries) {
    const {height, width, fill} = sheetBoundaries
    const strategyConstructor = this.policy.call(fill)
    this.addSheet(sheetId, new strategyConstructor(width, height))
  }

  public getCellValue(address: SimpleCellAddress): DataInterpreterValue {
    const vertex = this.getCell(address)
    const cellMetadata = this.getCellMetadata(address)

    if (vertex === undefined) {
      return new CellData(EmptyValue, cellMetadata)
    } else if (vertex instanceof ArrayVertex) {
      return new CellData(vertex.getArrayCellValue(address), cellMetadata)
    }
      
    return new CellData(vertex.getCellValue(), cellMetadata)
  }

  public getRawValue(address: SimpleCellAddress): DataRawCellContent {
    const vertex = this.getCell(address)
    const cellMetadata = this.getCellMetadata(address)

    if (vertex instanceof ValueCellVertex) {
      const values = vertex.getValues()

      return new CellData(values.rawValue, cellMetadata)
    } else if (vertex instanceof ArrayVertex) {
      return new CellData(vertex.getArrayCellRawValue(address), cellMetadata)
    }

    return new CellData(null, cellMetadata)
  }

  /** @inheritDoc */
  public setCell(address: SimpleCellAddress, newVertex: CellVertex) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    const existingCell = sheetMapping.get(address)

    sheetMapping.set(address, {
      vertex: newVertex,
      metadata: existingCell?.metadata
    })
  }

  /** @inheritDoc */
  public setCellMetadata(address: SimpleCellAddress, cellMetadata: CellMetadata) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    const existingCell = sheetMapping.get(address)

    if (!cellMetadata || Object.keys(cellMetadata).length === 0) {
      if (existingCell?.vertex) {
        sheetMapping.set(address, {
          vertex: existingCell?.vertex,
        })
        return
      }
      sheetMapping.remove(address)
      return
    }
    
    sheetMapping.set(address, {
      vertex: existingCell?.vertex,
      metadata: cellMetadata
    })
  }

  public moveCell(source: SimpleCellAddress, destination: SimpleCellAddress) {
    const sheetMapping = this.mapping.get(source.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized.')
    }
    if (source.sheet !== destination.sheet) {
      throw Error('Cannot move cells between sheets.')
    }
    if (sheetMapping.has(destination)) {
      throw new Error('Cannot move cell. Destination already occupied.')
    }
    const cell = sheetMapping.get(source)
    if (cell === undefined) {
      throw new Error('Cannot move cell. No cell with such address.')
    }
    if (cell.vertex) {
      this.setCell(destination, cell.vertex)
    }
    
    if (cell.metadata) {
      this.setCellMetadata(destination, cell.metadata)
    }
    
    this.removeCell(source)
    this.removeCellMetadata(source)
  }

  public removeCell(address: SimpleCellAddress) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    const existingCell = sheetMapping.get(address)

    if (existingCell?.metadata) {
      sheetMapping.set(address, {
        metadata: existingCell.metadata
      })
      return
    }
    sheetMapping.remove(address)
  }

  public removeCellMetadata(address: SimpleCellAddress) {
    const sheetMapping = this.mapping.get(address.sheet)
    if (!sheetMapping) {
      throw Error('Sheet not initialized')
    }
    const existingCell = sheetMapping.get(address)

    if (existingCell?.vertex) {
      sheetMapping.set(address, {
        vertex: existingCell.vertex
      })
      return
    }
    sheetMapping.remove(address)
  }

  /** @inheritDoc */
  public has(address: SimpleCellAddress): boolean {
    const sheetMapping = this.mapping.get(address.sheet)
    if (sheetMapping === undefined) {
      return false
    }
    return sheetMapping.has(address)
  }

  /** @inheritDoc */
  public getHeight(sheetId: number): number {
    const sheetMapping = this.mapping.get(sheetId)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheetId)
    }
    return sheetMapping.getHeight()
  }

  /** @inheritDoc */
  public getWidth(sheetId: number): number {
    const sheetMapping = this.mapping.get(sheetId)
    if (!sheetMapping) {
      throw new NoSheetWithIdError(sheetId)
    }
    return sheetMapping.getWidth()
  }

  public addRows(sheet: number, row: number, numberOfRows: number) {
    const sheetMapping = this.mapping.get(sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet)
    }
    sheetMapping.addRows(row, numberOfRows)
  }

  public removeRows(removedRows: RowsSpan) {
    const sheetMapping = this.mapping.get(removedRows.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedRows.sheet)
    }
    sheetMapping.removeRows(removedRows)
  }

  public removeSheet(sheetId: number) {
    this.mapping.delete(sheetId)
  }

  public addColumns(sheet: number, column: number, numberOfColumns: number) {
    const sheetMapping = this.mapping.get(sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(sheet)
    }
    sheetMapping.addColumns(column, numberOfColumns)
  }

  public removeColumns(removedColumns: ColumnsSpan) {
    const sheetMapping = this.mapping.get(removedColumns.sheet)
    if (sheetMapping === undefined) {
      throw new NoSheetWithIdError(removedColumns.sheet)
    }
    sheetMapping.removeColumns(removedColumns)
  }

  public* verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex> {
    yield* this.mapping.get(rowsSpan.sheet)!.verticesFromRowsSpan(rowsSpan) // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  public* verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex> {
    yield* this.mapping.get(columnsSpan.sheet)!.verticesFromColumnsSpan(columnsSpan) // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  public* entriesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
    yield* this.mapping.get(rowsSpan.sheet)!.entriesFromRowsSpan(rowsSpan)
  }

  public* entriesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
    yield* this.mapping.get(columnsSpan.sheet)!.entriesFromColumnsSpan(columnsSpan)
  }

  public* entries(): IterableIterator<[SimpleCellAddress, Maybe<CellVertexMetadata>]> {
    for (const [sheet, mapping] of this.mapping.entries()) {
      yield* mapping.getEntries(sheet)
    }
  }

  public* sheetEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertexMetadata]> {
    const sheetMapping = this.mapping.get(sheet)
    if (sheetMapping !== undefined) {
      yield* sheetMapping.getEntries(sheet)
    } else {
      throw new NoSheetWithIdError(sheet)
    }
  }
}
