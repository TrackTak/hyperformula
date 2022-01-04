/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { RawCellContent } from '..'
import {CellError} from '../Cell'
import {CellData, ExtendedNumber} from '../interpreter/InterpreterValue'
import { Maybe } from '../Maybe'

export type ValueCellVertexValue = ExtendedNumber | boolean | string | CellError
export type DataValueCellVertexValue = CellData<ValueCellVertexValue>

export interface RawAndParsedValue {
  parsedValue: ValueCellVertexValue,
  rawValue: RawCellContent,
  metadata: Maybe<any>,
}

/**
 * Represents vertex which keeps static cell value
 */
export class ValueCellVertex {
  /** Static cell value. */
  constructor(private parsedValue: ValueCellVertexValue, private rawValue: RawCellContent, public metadata?: any) {
  }

  public getValues(): RawAndParsedValue {
    return {parsedValue: this.parsedValue, rawValue: this.rawValue, metadata: this.metadata}
  }

  public setValues(values: RawAndParsedValue, metadata: Maybe<any>) {
    this.parsedValue = values.parsedValue
    this.rawValue = values.rawValue
    this.metadata = metadata
  }

  /**
   * Returns cell value stored in vertex
   */
  public getCellValue(): DataValueCellVertexValue {
    return new CellData(this.parsedValue, this.metadata)
  }

  public setCellValue(_cellValue: DataValueCellVertexValue): never {
    throw 'SetCellValue is deprecated for ValueCellVertex'
  }
}
