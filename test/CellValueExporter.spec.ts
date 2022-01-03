import {CellData, DetailedCellError, ErrorType, HyperFormula} from '../src'
import {CellError} from '../src/Cell'
import {Config} from '../src/Config'
import {ErrorMessage} from '../src/error-message'
import {Exporter} from '../src/Exporter'
import {plPL} from '../src/i18n/languages'
import {EmptyValue} from '../src/interpreter/InterpreterValue'
import {LazilyTransformingAstService} from '../src/LazilyTransformingAstService'
import {NamedExpressions} from '../src/NamedExpressions'
import {SheetIndexMappingFn} from '../src/parser/addressRepresentationConverters'
import {EmptyStatistics} from '../src/statistics'
import {detailedError} from './testUtils'

const namedExpressionsMock = {} as NamedExpressions
const sheetIndexMock = {} as SheetIndexMappingFn
const lazilyTransforminService = new LazilyTransformingAstService(new EmptyStatistics())

describe('rounding', () => {
  it('no rounding', () => {
    const config = new Config({smartRounding: false})
    const cellValueExporter = new Exporter(config, namedExpressionsMock, sheetIndexMock, lazilyTransforminService)
    expect(cellValueExporter.exportValue(new CellData(1.000000000000001)).cellValue).toBe(1.000000000000001)
    expect(cellValueExporter.exportValue(new CellData(-1.000000000000001)).cellValue).toBe(-1.000000000000001)
    expect(cellValueExporter.exportValue(new CellData(0.000000000000001)).cellValue).toBe(0.000000000000001)
    expect(cellValueExporter.exportValue(new CellData(-0.000000000000001)).cellValue).toBe(-0.000000000000001)
    expect(cellValueExporter.exportValue(new CellData(true)).cellValue).toBe(true)
    expect(cellValueExporter.exportValue(new CellData(false)).cellValue).toBe(false)
    expect(cellValueExporter.exportValue(new CellData(1)).cellValue).toBe(1)
    expect(cellValueExporter.exportValue(new CellData(EmptyValue)).cellValue).toBe(null)
    expect(cellValueExporter.exportValue(new CellData('abcd')).cellValue).toBe('abcd')
  })

  it('with rounding', () => {
    const config = new Config()
    const cellValueExporter = new Exporter(config, namedExpressionsMock, sheetIndexMock, lazilyTransforminService)
    expect(cellValueExporter.exportValue(new CellData(1.0000000000001)).cellValue).toBe(1.0000000000001)
    expect(cellValueExporter.exportValue(new CellData(-1.0000000000001)).cellValue).toBe(-1.0000000000001)
    expect(cellValueExporter.exportValue(new CellData(1.000000000000001)).cellValue).toBe(1)
    expect(cellValueExporter.exportValue(new CellData(-1.000000000000001)).cellValue).toBe(-1)
    expect(cellValueExporter.exportValue(new CellData(0.0000000000001)).cellValue).toBe(0.0000000000001)
    expect(cellValueExporter.exportValue(new CellData(-0.0000000000001)).cellValue).toBe(-0.0000000000001)
    expect(cellValueExporter.exportValue(new CellData(true)).cellValue).toBe(true)
    expect(cellValueExporter.exportValue(new CellData(false)).cellValue).toBe(false)
    expect(cellValueExporter.exportValue(new CellData(1)).cellValue).toBe(1)
    expect(cellValueExporter.exportValue(new CellData(EmptyValue)).cellValue).toBe(null)
    expect(cellValueExporter.exportValue(new CellData('abcd')).cellValue).toBe('abcd')
  })
})

describe('detailed error', () => {
  it('should return detailed errors', () => {
    const config = new Config({language: 'enGB'})
    const cellValueExporter = new Exporter(config, namedExpressionsMock, sheetIndexMock, lazilyTransforminService)

    const error = cellValueExporter.exportValue(new CellData(new CellError(ErrorType.VALUE))).cellValue as DetailedCellError

    expect(error).toEqualError(detailedError(ErrorType.VALUE))
    expect(error.value).toEqual('#VALUE!')
  })

  it('should return detailed errors with translation', () => {
    HyperFormula.registerLanguage('plPL', plPL)
    const config = new Config({language: 'plPL'})
    const cellValueExporter = new Exporter(config, namedExpressionsMock, sheetIndexMock, lazilyTransforminService)

    const error = cellValueExporter.exportValue(new CellData(new CellError(ErrorType.VALUE))).cellValue as DetailedCellError
    
    expect(error).toEqualError(detailedError(ErrorType.VALUE, undefined, config))
    expect(error.value).toEqual('#ARG!')
  })

  it('pretty print', () => {
    expect(`${detailedError(ErrorType.REF, ErrorMessage.DateBounds)}`).toEqual('#REF!')
  })
})
