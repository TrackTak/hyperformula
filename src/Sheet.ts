/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {DataRawCellContent, InputCell} from './CellContentParser'
import {InvalidArgumentsError} from './errors'

export interface GenericSheet<Cell, SheetMetadata> {
  cells: Cell[][],
  sheetMetadata?: SheetMetadata,
}

export type GenericSheets<Cell, SheetMetadata> = Record<string, GenericSheet<Cell, SheetMetadata>>

/**
 * Object with Two-dimenstional array representation of cells
 */
export type Sheet = GenericSheet<DataRawCellContent, any>

export type Sheets = Record<string, Sheet>

export type InputSheet<CellMetadata, SheetMetadata> = GenericSheet<InputCell<CellMetadata>, SheetMetadata>

export type InputSheets<CellMetadata, SheetMetadata> = Record<string, InputSheet<CellMetadata, SheetMetadata>>

/**
 * Represents size of a sheet
 */
export type SheetDimensions = {
  width: number,
  height: number,
}

/**
 * Represents size and fill ratio of a sheet
 */
export interface SheetBoundaries {
  width: number,
  height: number,
  fill: number,
}

export function validateAsSheet(sheet: InputSheet<any, any>): void {
  if (typeof sheet !== 'object' || sheet === null) {
    throw new InvalidArgumentsError('a sheet object.')
  }

  validateAsSheetContent(sheet.cells)
}

export function validateAsSheetContent(cells: InputCell<any>[][]): void {
  if (!Array.isArray(cells)) {
    throw new InvalidArgumentsError('an array of arrays.')
  }
  for (let i = 0; i < cells.length; i++) {
    if (!Array.isArray(cells[i])) {
      throw new InvalidArgumentsError('an array of arrays.')
    }
  }
}

/**
 * Returns actual width, height and fill ratio of a sheet
 *
 * @param cells - two-dimmensional array sheet representation
 */
export function findBoundaries(cells: (InputCell<any> | DataRawCellContent)[][]): SheetBoundaries {
  let width = 0
  let height = 0
  let cellsCount = 0

  for (let currentRow = 0; currentRow < cells.length; currentRow++) {
    let currentRowWidth = 0
    for (let currentCol = 0; currentCol < cells[currentRow].length; currentCol++) {
      const currentValue = cells[currentRow][currentCol]
      if ((currentValue?.cellValue === undefined || currentValue.cellValue === null) && !currentValue?.metadata) {
        continue
      }
      currentRowWidth = currentCol + 1
      ++cellsCount
    }

    width = Math.max(width, currentRowWidth)
    if (currentRowWidth > 0) {
      height = currentRow + 1
    }
  }

  const sheetSize = width * height

  return {
    height: height,
    width: width,
    fill: sheetSize === 0 ? 0 : cellsCount / sheetSize,
  }
}
