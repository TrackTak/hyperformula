/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {CellError} from '../Cell'
import {DataRawCellContent} from '../CellContentParser'
import {CellData, CellMetadata, ExtendedNumber} from '../interpreter/InterpreterValue'
import { Maybe } from '../Maybe'

export type ValueCellVertexValue = CellData<ExtendedNumber | boolean | string | CellError>

export interface RawAndParsedValue {
  parsedValue: ValueCellVertexValue,
  rawValue: DataRawCellContent,
  metadata: Maybe<CellMetadata>,
}

/**
 * Represents vertex which keeps static cell value
 */
export class ValueCellVertex {
  /** Static cell value. */
  constructor(private parsedValue: ValueCellVertexValue, private rawValue: DataRawCellContent, public readonly metadata?: CellMetadata) {
  }

  public getValues(): RawAndParsedValue {
    return {parsedValue: this.parsedValue, rawValue: this.rawValue, metadata: this.metadata}
  }

  public setValues(values: RawAndParsedValue) {
    this.parsedValue = values.parsedValue
    this.rawValue = values.rawValue
  }

  /**
   * Returns cell value stored in vertex
   */
  public getCellValue(): ValueCellVertexValue {
    return this.parsedValue
  }

  public setCellValue(_cellValue: ValueCellVertexValue): never {
    throw 'SetCellValue is deprecated for ValueCellVertex'
  }
}
