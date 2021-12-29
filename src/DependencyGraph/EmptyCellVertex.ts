/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {SimpleCellAddress} from '../Cell'
import {CellData, CellMetadata, EmptyValue, EmptyValueType} from '../interpreter/InterpreterValue'

/**
 * Represents singleton vertex bound to all empty cells
 */
export class EmptyCellVertex {
  constructor(
    public address: SimpleCellAddress, //might be outdated!
    public readonly metadata?: CellMetadata
  ) {
  }

  /**
   * Retrieves cell value bound to that singleton
   */
  public getCellValue(): CellData<EmptyValueType> {
    return new CellData(EmptyValue, this.metadata)
  }
}
