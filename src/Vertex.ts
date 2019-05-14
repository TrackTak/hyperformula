import {AbsoluteCellRange} from './AbsoluteCellRange'
import {CellValue, SimpleCellAddress} from './Cell'
import {CriterionLambda} from './interpreter/Criterion'
import {Matrix} from './Matrix'
import {Ast} from './parser'

let nextVertexId = 1
const getNextVertexId = (): number => {
  return nextVertexId++
}

/**
 * Represents vertex which keeps values of one or more cells
 */
export type CellVertex = FormulaCellVertex | ValueCellVertex | EmptyCellVertex | MatrixVertex

/**
 * Represents any vertex
 */
export type Vertex = CellVertex | RangeVertex

export class MatrixVertex {
  public static fromRange(range: AbsoluteCellRange, formula?: Ast): MatrixVertex {
    return new MatrixVertex(range.start, range.width(), range.height(), formula)
  }
  public readonly width: number
  public readonly height: number
  public readonly kind = 'matrix'
  public readonly id: number
  private formula: Ast | null
  private cellAddress: SimpleCellAddress
  private matrix: Matrix

  constructor(cellAddress: SimpleCellAddress, width: number, height: number, formula?: Ast, id: number = getNextVertexId()) {
    this.cellAddress = cellAddress
    this.width = width
    this.height = height
    this.formula = formula || null
    this.matrix = new Matrix([])
    this.id = id
  }

  public setCellValue(matrix: CellValue) {
    this.matrix = matrix as Matrix
  }

  public getCellValue() {
    return this.matrix
  }

  public getMatrixCellValue(address: SimpleCellAddress): number {
    const col = address.col - this.cellAddress.col
    const row = address.row - this.cellAddress.row

    return this.matrix.get(col, row)
  }

  public getAddress(): SimpleCellAddress {
    return this.cellAddress
  }

  public getFormula(): Ast | null {
    return this.formula
  }

  public isFormula(): boolean {
    return this.formula !== null
  }
}

/**
 * Represents vertex which keeps formula
 */
export class FormulaCellVertex {
  public readonly kind = 'formula'

  public readonly id: number
  /** Most recently computed value of this formula. */
  private cachedCellValue?: CellValue

  /** Formula in AST format */
  private formula: Ast

  /** Address which this vertex represents */
  private cellAddress: SimpleCellAddress

  constructor(formula: Ast, cellAddress: SimpleCellAddress, id: number = getNextVertexId()) {
    this.formula = formula
    this.cellAddress = cellAddress
    this.id = id
  }

  /**
   * Returns formula stored in this vertex
   */
  public getFormula(): Ast {
    return this.formula
  }

  /**
   * Returns address of the cell associated with vertex
   */
  public getAddress(): SimpleCellAddress {
    return this.cellAddress
  }

  /**
   * Sets computed cell value stored in this vertex
   */
  public setCellValue(cellValue: CellValue) {
    this.cachedCellValue = cellValue
  }

  /**
   * Returns cell value stored in vertex
   */
  public getCellValue() {
    if (this.cachedCellValue != null) {
      return this.cachedCellValue
    } else {
      throw Error('Value of the formula cell is not computed.')
    }
  }
}

/**
 * Represents vertex which keeps static cell value
 */
export class ValueCellVertex {
  public readonly kind = 'value'

  public readonly id: number
  /** Static cell value. */
  private cellValue: CellValue

  constructor(cellValue: CellValue, id: number = getNextVertexId()) {
    this.cellValue = cellValue
    this.id = id
  }

  /**
   * Returns cell value stored in vertex
   */
  public getCellValue() {
    return this.cellValue
  }

  /**
   * Sets computed cell value stored in this vertex
   */
  public setCellValue(cellValue: CellValue) {
    this.cellValue = cellValue
  }
}

/**
 * Represents singleton vertex bound to all empty cells
 */
export class EmptyCellVertex {

  /**
   * Retrieves singleton
   */
  public static getSingletonInstance() {
    if (!EmptyCellVertex.instance) {
      EmptyCellVertex.instance = new EmptyCellVertex()
    }
    return EmptyCellVertex.instance
  }

  /** Singleton instance. */
  private static instance: EmptyCellVertex
  public readonly id: number = 0
  public readonly kind = 'empty'

  /**
   * Retrieves cell value bound to that singleton
   */
  public getCellValue() {
    return 0
  }
}

/**
 * Represents cache structure for one criterion
 */
export type CriterionCache = Map<string, [CellValue, CriterionLambda]>

/**
 * Represents vertex bound to range
 */
export class RangeVertex {
  public readonly kind = 'range'
  /** Cache for associative aggregate functions. */
  private functionCache: Map<string, CellValue>

  /** Cache for criterion-based functions. */
  private criterionFuncitonCache: Map<string, CriterionCache>

  constructor(private range: AbsoluteCellRange, public readonly id: number = getNextVertexId()) {
    this.functionCache = new Map()
    this.criterionFuncitonCache = new Map()
  }

  public get start() {
    return this.range.start
  }

  public get end() {
    return this.range.end
  }

  /**
   * Returns cached value stored for given function
   *
   * @param functionName - name of the function
   */
  public getFunctionValue(functionName: string): CellValue | null {
    return this.functionCache.get(functionName) || null
  }

  /**
   * Stores cached value for given function
   *
   * @param functionName - name of the function
   * @param value - cached value
   */
  public setFunctionValue(functionName: string, value: CellValue) {
    this.functionCache.set(functionName, value)
  }

  /**
   * Returns cached value for given cache key and criterion text representation
   *
   * @param cacheKey - key to retrieve from the cache
   * @param criterionString - criterion text (ex. '<=5')
   */
  public getCriterionFunctionValue(cacheKey: string, criterionString: string): CellValue | null {
    const values = this.getCriterionFunctionValues(cacheKey)
    const value = values.get(criterionString)
    return value ? value[0] : null
  }

  /**
   * Returns all cached values stored for given criterion function
   *
   * @param cacheKey - key to retrieve from the cache
   */
  public getCriterionFunctionValues(cacheKey: string): Map<string, [CellValue, CriterionLambda]> {
    return this.criterionFuncitonCache.get(cacheKey) || new Map()
  }

  /**
   * Stores all values for given criterion function
   *
   * @param cacheKey - key to store in the cache
   * @param values - map with values
   */
  public setCriterionFunctionValues(cacheKey: string, values: CriterionCache) {
    this.criterionFuncitonCache.set(cacheKey, values)
  }

  /**
   * Clears function cache
   */
  public clear() {
    this.functionCache.clear()
    this.criterionFuncitonCache.clear()
  }

  /**
   * Returns start of the range (it's top-left corner)
   */
  public getStart(): SimpleCellAddress {
    return this.start
  }

  /**
   * Returns end of the range (it's bottom-right corner)
   */
  public getEnd(): SimpleCellAddress {
    return this.end
  }
}
