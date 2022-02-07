/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { RawCellContent } from '..'
import {AbsoluteCellRange} from '../AbsoluteCellRange'
import {ArraySize} from '../ArraySize'
import {ArrayValue, ErroredArray, IArray, NotComputedArray} from '../ArrayValue'
import { AsyncPromise } from '../AsyncPromise'
import {CellError, equalSimpleCellAddress, ErrorType, SimpleCellAddress} from '../Cell'
import {ErrorMessage} from '../error-message'
import {EmptyValue, getRawValue, InternalScalarValue, InterpreterValue} from '../interpreter/InterpreterValue'
import {LazilyTransformingAstService} from '../LazilyTransformingAstService'
import {Maybe} from '../Maybe'
import {Ast, AstNodeType} from '../parser'
import {ColumnsSpan, RowsSpan} from '../Span'

export abstract class FormulaVertex {
  private resolveIndex?: number

  protected constructor(
    protected formula: Ast,
    protected cellAddress: SimpleCellAddress,
    public version: number,
  ) {
  }

  public setResolveIndex(resolveIndex: number) {
    this.resolveIndex = resolveIndex
  }

  public getResolveIndex() {
    if (this.resolveIndex === undefined) {
      throw new Error('resolveIndex has not been set')
    }

    return this.resolveIndex
  }

  public checkForAsyncPromises(ast: Ast): (AsyncPromise | undefined)[] {
    switch (ast.type) {
      case AstNodeType.FUNCTION_CALL: {
        return [ast.asyncPromise]
      }
      case AstNodeType.DIV_OP:
      case AstNodeType.CONCATENATE_OP:
      case AstNodeType.EQUALS_OP:
      case AstNodeType.GREATER_THAN_OP:
      case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
      case AstNodeType.LESS_THAN_OP:
      case AstNodeType.LESS_THAN_OR_EQUAL_OP:
      case AstNodeType.MINUS_OP:
      case AstNodeType.NOT_EQUAL_OP:
      case AstNodeType.PLUS_OP:
      case AstNodeType.POWER_OP:
      case AstNodeType.TIMES_OP: {
        const left = this.checkForAsyncPromises(ast.left)
        const right = this.checkForAsyncPromises(ast.right)
        
        return [...left, ...right]
      }
      case AstNodeType.MINUS_UNARY_OP:
      case AstNodeType.PLUS_UNARY_OP:
      case AstNodeType.PERCENT_OP: {
        return this.checkForAsyncPromises(ast.value)
      }
      case AstNodeType.PARENTHESIS: {
        return this.checkForAsyncPromises(ast.expression)
      }
      case AstNodeType.ARRAY: {
        const values: (AsyncPromise | undefined)[] = []

        for (const row of ast.args) {
          row.map(ast => {
            const value = this.checkForAsyncPromises(ast)

            values.push(...value)
          })
        }

        return [...values]
      }
      default:
        return []
      }
  }

  public getAsyncPromises(): AsyncPromise[] {
    const asyncPromises = this.checkForAsyncPromises(this.formula).filter(x => x !== undefined)

    return asyncPromises as AsyncPromise[]
  }

  public hasAsyncPromises() {
    const asyncPromises = this.checkForAsyncPromises(this.formula).filter(x => x !== undefined)

    return asyncPromises.length > 0
  }

  public isResolveIndexSet() {
    return this.resolveIndex !== undefined
  }

  public get width(): number {
    return 1
  }

  public get height(): number {
    return 1
  }

  static fromAst(formula: Ast, address: SimpleCellAddress, size: ArraySize, version: number) {
    if (size.isScalar()) {
      return new FormulaCellVertex(formula, address, version)
    } else {
      return new ArrayVertex(formula, address, size, version)
    }
  }

  /**
   * Returns formula stored in this vertex
   */
  public getFormula(updatingService: LazilyTransformingAstService): Ast {
    this.ensureRecentData(updatingService)
    return this.formula
  }

  public ensureRecentData(updatingService: LazilyTransformingAstService) {
    if (this.version != updatingService.version()) {
      const [newAst, newAddress, newVersion] = updatingService.applyTransformations(this.formula, this.cellAddress, this.version)
      this.formula = newAst
      this.cellAddress = newAddress
      this.version = newVersion
    }
  }

  /**
   * Returns address of the cell associated with vertex
   */
  public getAddress(updatingService: LazilyTransformingAstService): SimpleCellAddress {
    this.ensureRecentData(updatingService)
    return this.cellAddress
  }

  public recalculateAsyncPromisesWhenNeeded() {
    this.getAsyncPromises().forEach((asyncPromise) => {
      asyncPromise.resetIsResolvedValue()
    })
  }

  /**
   * Returns true if the vertex has asynchronous promises pending.
   */
  public hasAsyncPromisesPending(): boolean {
    return !!this.getAsyncPromises().some(x => !x.getIsResolvedValue())
  }

  /**
   * Sets computed cell value stored in this vertex
   */
  public abstract setCellValue(cellValue: InterpreterValue): InterpreterValue

  /**
   * Returns cell value stored in vertex
   */
  public abstract getCellValue(): InterpreterValue

  public abstract valueOrUndef(): Maybe<InterpreterValue>

  public abstract isComputed(): boolean
}

export class ArrayVertex extends FormulaVertex {
  array: IArray

  constructor(formula: Ast, cellAddress: SimpleCellAddress, size: ArraySize, version: number = 0) {
    super(formula, cellAddress, version)
    if (size.isRef) {
      this.array = new ErroredArray(new CellError(ErrorType.REF, ErrorMessage.NoSpaceForArrayResult), ArraySize.error())
    } else {
      this.array = new NotComputedArray(size)
    }
  }

  get width(): number {
    return this.array.width()
  }

  get height(): number {
    return this.array.height()
  }

  get sheet(): number {
    return this.cellAddress.sheet
  }

  get leftCorner(): SimpleCellAddress {
    return this.cellAddress
  }

  setCellValue(cellValue: InterpreterValue): InterpreterValue {
    if (cellValue instanceof CellError) {
      this.setErrorValue(cellValue)
      return cellValue
    }
    const array = ArrayValue.fromInterpreterValue(cellValue)
    array.resize(this.array.size)
    this.array = array
    
    return cellValue
  }

  getCellValue(): InterpreterValue {
    if (this.array instanceof NotComputedArray) {
      throw Error('Array not computed yet.')
    }
    return this.array.simpleRangeValue()
  }

  public valueOrUndef(): Maybe<InterpreterValue> {
    if (this.array instanceof NotComputedArray) {
      return undefined
    }
    return this.array.simpleRangeValue()
  }

  getArrayCellValue(address: SimpleCellAddress): InternalScalarValue {
    const col = address.col - this.cellAddress.col
    const row = address.row - this.cellAddress.row

    try {
      return this.array.get(col, row)
    } catch (e) {
      return new CellError(ErrorType.REF)
    }
  }

  getArrayCellRawValue(address: SimpleCellAddress): RawCellContent {
    const val = this.getArrayCellValue(address)
    if (val instanceof CellError || val === EmptyValue) {
      return undefined
    }
      
    return getRawValue(val)
  }

  setArrayCellValue(address: SimpleCellAddress, value: number): void {
    const col = address.col - this.cellAddress.col
    const row = address.row - this.cellAddress.row
    if (this.array instanceof ArrayValue) {
      this.array.set(col, row, value)
    }
  }

  setNoSpace(): InterpreterValue {
    this.array = new ErroredArray(new CellError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult), ArraySize.error())
    return this.getCellValue()
  }

  getRange(): AbsoluteCellRange {
    return AbsoluteCellRange.spanFrom(this.cellAddress, this.width, this.height)
  }

  getRangeOrUndef(): Maybe<AbsoluteCellRange> {
    return AbsoluteCellRange.spanFromOrUndef(this.cellAddress, this.width, this.height)
  }

  setAddress(address: SimpleCellAddress) {
    this.cellAddress = address
  }

  setFormula(newFormula: Ast) {
    this.formula = newFormula
  }

  spansThroughSheetRows(sheet: number, startRow: number, endRow: number = startRow): boolean {
    return (this.cellAddress.sheet === sheet) &&
      (this.cellAddress.row <= endRow) &&
      (startRow < this.cellAddress.row + this.height)
  }

  spansThroughSheetColumn(sheet: number, col: number, columnEnd: number = col): boolean {
    return (this.cellAddress.sheet === sheet) &&
      (this.cellAddress.col <= columnEnd) &&
      (col < this.cellAddress.col + this.width)
  }

  isComputed() {
    return (!(this.array instanceof NotComputedArray))
  }

  columnsFromArray() {
    return ColumnsSpan.fromNumberOfColumns(this.cellAddress.sheet, this.cellAddress.col, this.width)
  }

  rowsFromArray() {
    return RowsSpan.fromNumberOfRows(this.cellAddress.sheet, this.cellAddress.row, this.height)
  }

  /**
   * No-op as array vertices are transformed eagerly.
   * */
  ensureRecentData(_updatingService: LazilyTransformingAstService) {
  }

  isLeftCorner(address: SimpleCellAddress): boolean {
    return equalSimpleCellAddress(this.cellAddress, address)
  }

  private setErrorValue(error: CellError) {
    this.array = new ErroredArray(error, this.array.size)
  }
}

/**
 * Represents vertex which keeps formula
 */
export class FormulaCellVertex extends FormulaVertex {
  /** Most recently computed value of this formula. */
  private cachedCellValue: Maybe<InterpreterValue>

  constructor(
    /** Formula in AST format */
    formula: Ast,
    /** Address which this vertex represents */
    address: SimpleCellAddress,
    version: number,
  ) {
    super(formula, address, version)
  }

  public valueOrUndef(): Maybe<InterpreterValue> {
    return this.cachedCellValue
  }

  /**
   * Sets computed cell value stored in this vertex
   */
  public setCellValue(cellValue: InterpreterValue): InterpreterValue {
    this.cachedCellValue = cellValue

    return cellValue
  }

  /**
   * Returns cell value stored in vertex
   */
  public getCellValue(): InterpreterValue {
    if (this.cachedCellValue !== undefined) {
      return this.cachedCellValue
    } else {
      throw Error('Value of the formula cell is not computed.')
    }
  }

  public isComputed() {
    return (this.cachedCellValue !== undefined)
  }
}
