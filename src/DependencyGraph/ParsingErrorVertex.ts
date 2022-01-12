/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import {CellError} from '../Cell'
import { CellData } from '../interpreter/InterpreterValue'
import {ParsingError} from '../parser/Ast'

export class ParsingErrorVertex {
  constructor(
    public readonly errors: ParsingError[],
    public readonly rawInput: string,
    public metadata?: any
  ) {
  }

  public getCellValue(): CellData<CellError> {
    return new CellData(CellError.parsingError(), this.metadata) 
  }

  public getFormula(): string {
    return this.rawInput
  }
}
