import {CellData, DataRawCellContent, DetailedCellError, ErrorType, HyperFormula} from '../src'
import {AbsoluteCellRange} from '../src/AbsoluteCellRange'
import {CellType, CellValueDetailedType, CellValueType} from '../src/Cell'
import {Config} from '../src/Config'
import {ErrorMessage} from '../src/error-message'
import {plPL} from '../src/i18n/languages'
import {adr, detailedError, expectArrayWithSameContent} from './testUtils'

describe('#buildFromArray', () => {
  it('load single value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('load simple sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
    ]})

    expect(engine.getCellValue(adr('C2')).cellValue).toBe(6)
  })

  it('evaluate empty vertex', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=A5' }]]})

    expect(engine.getCellValue(adr('A5')).cellValue).toBe(null)
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(null)
  })

  it('evaluate empty vertex reference', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: null }, { cellValue: '=A1' }]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toBe(null)
  })

  it('cycle', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=B1' }, { cellValue: '=C1' }, { cellValue: '=A1' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
  })

  it('cycle with formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '5' }, { cellValue: '=A1+B1' }]]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
  })

  it('operator precedence', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=3*7*2-4*1+2' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(40)
  })

  it('operator precedence and brackets', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=3*7+((2-4)*(1+2)+3)*2' }]]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(15)
  })

  it('operator precedence with cells', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '=B1*2+A1' }]]})
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(11)
  })

  it('parsing error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=A1B1' }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('dependency before value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=B1' }, { cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=SUM(B2:C2)' }, { cellValue: '1' }, { cellValue: '2' }],
    ]})
    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(3)
  })

  it('should handle different input types', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '' }, { cellValue: null }, { cellValue: undefined }, { cellValue: 1}, {cellValue: true }]]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(null)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(null)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('E1')).cellValue).toBe(true)
  })

  it('should work with other numerals', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{cellValue: 0o777 }, {cellValue: 0xFF}, {cellValue: 0b1010}, {cellValue: 1_000_000_000_000}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(511)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(255)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(10)
    expect(engine.getCellValue(adr('D1')).cellValue).toBe(1000000000000)
  })

  it('should be possible to build graph with reference to not existing sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=Sheet2!A2' }]]})

    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=Sheet2!A2')
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.REF))
  })

  it('should propagate parsing errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(' }, { cellValue: '=A1' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=SUM(')

    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('B1')).cellValue).toEqual('=A1')
  })
})

describe('#getCellFormula', () => {
  it('returns formula when present', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1,2,3,C3)' }],
    ]})

    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=SUM(1,2,3,C3)')
  })

  it('works with -0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=-0' }],
    ]})

    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=-0')
  })

  it('returns undefined for simple values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '' }],
      [{ cellValue: '42' }],
      [{ cellValue: 'foobar' }],
    ]})

    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual(undefined)
    expect(engine.getCellFormula(adr('A2')).cellValue).toEqual(undefined)
    expect(engine.getCellFormula(adr('A3')).cellValue).toEqual(undefined)
    expect(engine.getCellFormula(adr('A4')).cellValue).toEqual(undefined)
  })

  it('returns matrix formula for matrix vertices', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '1' }, { cellValue: '1' }],
      [{ cellValue: '=MMULT(A1:B2,A1:B2)' }],
    ]})

    expect(engine.getCellFormula(adr('A3')).cellValue).toEqual('=MMULT(A1:B2,A1:B2)')
    expect(engine.getCellFormula(adr('A4')).cellValue).toEqual(undefined)
    expect(engine.getCellFormula(adr('B3')).cellValue).toEqual(undefined)
    expect(engine.getCellFormula(adr('B4')).cellValue).toEqual(undefined)
  })

  it('returns invalid formula literal', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=SUM(')
  })

  it('returns invalid matrix formula literal', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
    expect(engine.getCellFormula(adr('A1')).cellValue).toEqual('=TRANSPOSE(')
  })
})

describe('#getAllFormulas', () => {
  it('should return formulas from all sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [[{ cellValue: '=A()' }]] },
      Foo: { cells: [[{ cellValue: 1 }, { cellValue: '=SUM(A1)' }]]},
    })

    expect(engine.getAllSheetsFormulas()).toEqual({'Foo': { cells: [[undefined, { cellValue: '=SUM(A1)' }]] }, 'Sheet1': { cells: [[{ cellValue: '=A()' }]]} })
  })
})

describe('#getRangeFormulas', () => {
  it('should return formulas', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, A2)' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=SUM(' }, { cellValue: null }, { cellValue: 1 }]
    ]})

    const out = engine.getRangeFormulas(AbsoluteCellRange.spanFrom(adr('A1'), 3, 2))

    expectArrayWithSameContent([[{ cellValue: '=SUM(1, A2)' }, { cellValue: '=TRUE()' }, { cellValue: undefined }], [{ cellValue: '=SUM(1, A2)' }, { cellValue: '=TRUE()' }, { cellValue: undefined }]], out)
  })
})

describe('#getSheetFormulas', () => {
  it('should return formulas from sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, A2)' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=SUM(', metadata: { test: 'value' }}, { cellValue: '=SUM(1' },  { cellValue: null }, { cellValue: 1 }]
    ]})

    const out = engine.getSheetFormulas(0).cells

    expectArrayWithSameContent([[{ cellValue: '=SUM(1, A2)' }, { cellValue: '=TRUE()' }], [{ cellValue: '=SUM(', metadata: { test: 'value' }}, { cellValue: '=SUM(1' }]], out)
  })
})

describe('#getCellValue', () => {
  it('should return simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '' }, { cellValue: 1, metadata: { test: 'value' }}, { cellValue: '1' }, { cellValue: 'foo' }, { cellValue: true }, { cellValue: -1.000000000000001 }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('')
    expect(engine.getCellValue(adr('B1'))).toEqual({ cellValue: 1, metadata: { test: 'value' }})
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('E1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('F1')).cellValue).toEqual(-1)
  })

  it('should return null for empty cells', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: undefined }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(null)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(null)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(null)
  })

  it('should return value of a formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=1' }, { cellValue: '=SUM(1, A1)' }, { cellValue: '=TRUE()' }, { cellValue: '=1/0'}]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(true)
    expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('should return parsing error value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(' }]
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })

  it('should return value of a cell in a formula matrix', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=TRANSPOSE(A1:B1)' }],
    ]})

    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })

  it('should return translated error', () => {
    HyperFormula.registerLanguage('plPL', plPL)
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=#ARG!' }],
    ] }, {language: 'plPL'})

    const error = engine.getCellValue(adr('A1')).cellValue as DetailedCellError
    expect(error).toEqualError(detailedError(ErrorType.VALUE, '', new Config({language: 'plPL'})))
    expect(error.value).toEqual('#ARG!')
  })
})

describe('#getSheetDimensions', () => {
  it('should work for empty sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })

    expect(engine.getSheetDimensions(0)).toEqual({height: 0, width: 0})
  })

  it('should return sheet dimensions', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 1 }],
      [{ cellValue: 1 }, { cellValue: null }, { cellValue: 1 }],
    ]})

    expect(engine.getSheetDimensions(0)).toEqual({height: 2, width: 3})
  })
})

describe('#getAllSheetsDimensions', () => {
  it('should return dimension of all sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': { cells: [] },
      'Sheet2': { cells: [[{ cellValue: 1 }]] },
      'Foo': { cells: [[{ cellValue: null }]] },
      'Bar': { cells: [[{ cellValue: null }], [{ cellValue: null }, { cellValue: 'foo' }]] }
    })

    expect(engine.getAllSheetsDimensions()).toEqual({
      'Sheet1': {width: 0, height: 0},
      'Sheet2': {width: 1, height: 1},
      'Foo': {width: 0, height: 0},
      'Bar': {width: 2, height: 2},
    })
  })
})

describe('#getRangeValues', () => {
  it('should return values from range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, B1)' }, { cellValue: '=TRUE()' }, { cellValue: null }]
    ]})

    const out = engine.getRangeValues(AbsoluteCellRange.spanFrom(adr('A1'), 3, 1))

    expectArrayWithSameContent([[{ cellValue: 1 }, { cellValue: true }, { cellValue: null }]], out)
  })
})

describe('#getSheetValues', () => {
  it('should return values from sheet', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: '=SUM(1, A1)' }, { cellValue: null}, {cellValue: '=TRUE()' }, { cellValue: null }]
    ]})

    const out = engine.getSheetValues(0).cells
    
    expectArrayWithSameContent([[{ cellValue: 1 }, { cellValue: 'foo' }, { cellValue: 2 }, undefined, {cellValue: true }]], out)
  })
})

describe('#getAllValues', () => {
  it('should return values from all sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  []},
      Foo: { cells: [[{ cellValue: 1 }]]},
    })

    expect(engine.getAllSheetsValues()).toEqual({'Foo': { cells: [[{ cellValue: 1 }]] }, 'Sheet1': { cells: []} })
  })
})

describe('#getCellSerialized', () => {
  it('should return formula for formula vertex', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, A2)' }, { cellValue: '=SUM(1, A2)', metadata: { test: 'value' } }, { cellValue: '=SUM(1, A2)' }]
    ]})

    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual('=SUM(1, A2)')
    expect(engine.getCellSerialized(adr('B1'))).toEqual({
      cellValue: '=SUM(1, A2)',
      metadata: {
        test: 'value'
      }
    })
    expect(engine.getCellSerialized(adr('C1')).cellValue).toEqual('=SUM(1, A2)')
  })

  it('should return formula for parsing error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(' }]
    ]})

    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual('=SUM(')
  })

  it('should return simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: 1 }, { cellValue: '2' }, { cellValue: 'foo' }, { cellValue: true}]
    ]})

    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellSerialized(adr('B1')).cellValue).toEqual('2')
    expect(engine.getCellSerialized(adr('C1')).cellValue).toEqual('foo')
    expect(engine.getCellSerialized(adr('D1')).cellValue).toEqual(true)
  })

  it('should return empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: undefined }]
    ]})

    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual(null)
    expect(engine.getCellSerialized(adr('B1')).cellValue).toEqual(null)
    expect(engine.getCellSerialized(adr('C1')).cellValue).toEqual(null)
  })

  it('should return formula of a formula matrix', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '{=TRANSPOSE(A1:B1)}' }],
      [{ cellValue: '{=TRANSPOSE(A1:B1)}' }],
    ]})

    expect(engine.getCellSerialized(adr('A2')).cellValue).toEqual('{=TRANSPOSE(A1:B1)}')
    expect(engine.getCellSerialized(adr('A3')).cellValue).toEqual('{=TRANSPOSE(A1:B1)}')
  })

  it('should return translated error', () => {
    HyperFormula.registerLanguage('plPL', plPL)
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=#ARG!' }],
    ] }, {language: 'plPL'})

    expect(engine.getCellSerialized(adr('A1')).cellValue).toEqual('=#ARG!')
  })
})

describe('#getAllSheetsSerialized', () => {
  it('should serialize all sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: { cells:  [[{ cellValue: '=A()' }]], sheetMetadata: { test: 'value' } },
      Foo: { cells: [[{ cellValue: 1 }]]},
      Err1: { cells: [[{ cellValue: '=A1' }]] },
      Err2: { cells: [[{ cellValue: '234.23141234.2314' }]]},
      Err3: { cells: [[{ cellValue: '#DIV/0!' }]]},
    })

    expect(engine.getAllSheetsSerialized()).toEqual({
      'Foo': { cells: [[{ cellValue: 1 }]]},
      'Sheet1': { cells: [[{ cellValue: '=A()' }]], sheetMetadata: { test: 'value' }},
      'Err1': { cells: [[{ cellValue: '=A1' }]]},
      'Err2': { cells: [[{ cellValue: '234.23141234.2314' }]]},
      'Err3': { cells: [[{ cellValue: '#DIV/0!' }]]},
    })
  })
})

describe('#getRangeSerialized', () => {
  it('should return empty values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })

    expectArrayWithSameContent([[{ cellValue: null }, { cellValue: null }]], engine.getRangeSerialized(AbsoluteCellRange.spanFrom(adr('A1'), 2, 1)))
  })

  it('should return serialized cells from range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=SUM(1, B1)' }, { cellValue: '2' }, { cellValue: '#VALUE!' }, { cellValue: null}, {cellValue: '=#DIV/0!' }, { cellValue: '{=TRANSPOSE(A1:B1)}' }]
    ]})

    const out = engine.getRangeSerialized(AbsoluteCellRange.spanFrom(adr('A1'), 6, 1))

    expectArrayWithSameContent([[{ cellValue: '=SUM(1, B1)' }, { cellValue: '2' }, { cellValue: '#VALUE!' }, { cellValue: null}, {cellValue: '=#DIV/0!' }, { cellValue: '{=TRANSPOSE(A1:B1)}' }]], out)
  })
})

describe('#sheetName', () => {
  it('returns sheet name if sheet exists', () => {
    const [engine] = HyperFormula.buildEmpty()

    engine.addSheet()

    expect(engine.getSheetName(0)).toEqual('Sheet1')
  })

  it('returns undefined if sheet doesnt exists', () => {
    const [engine] = HyperFormula.buildEmpty()

    expect(engine.getSheetName(0)).toBeUndefined()
  })
})

describe('#sheetId', () => {
  it('returns id if sheet exists', () => {
    const [engine] = HyperFormula.buildEmpty()

    engine.addSheet('foobar')

    expect(engine.getSheetId('foobar')).toEqual(0)
  })

  it('returns undefined if sheet doesnt exists', () => {
    const [engine] = HyperFormula.buildEmpty()

    expect(engine.getSheetId('doesntexist')).toBeUndefined()
  })
})

describe('#doesSheetExist', () => {
  it('true if sheet exists', () => {
    const [engine] = HyperFormula.buildEmpty()

    engine.addSheet('foobar')

    expect(engine.doesSheetExist('foobar')).toBe(true)
  })

  it('false if sheet doesnt exist', () => {
    const [engine] = HyperFormula.buildEmpty()

    expect(engine.doesSheetExist('foobar')).toBe(false)
  })
})

describe('#numberOfSheets', () => {
  it('returns 0 if empty', () => {
    const [engine] = HyperFormula.buildEmpty()

    expect(engine.countSheets()).toBe(0)
  })

  it('returns number of sheets', () => {
    const [engine] = HyperFormula.buildEmpty()

    engine.addSheet('foo')

    expect(engine.countSheets()).toBe(1)
  })
})

describe('#sheetNames', () => {
  it('empty engine', () => {
    const [engine] = HyperFormula.buildEmpty()

    expect(engine.getSheetNames()).toEqual([])
  })

  it('returns sheet names', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [] })
    engine.addSheet('Foo')

    expect(engine.getSheetNames()).toEqual(['Sheet1', 'Foo'])
  })
})

describe('#getCellType', () => {
  it('empty cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: null }, { cellValue: undefined }]]})

    expect(engine.getCellType(adr('A1'))).toBe(CellType.EMPTY)
    expect(engine.getCellType(adr('B1'))).toBe(CellType.EMPTY)
    expect(engine.getCellType(adr('C1'))).toBe(CellType.EMPTY)
  })

  it('simple value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }, { cellValue: 'foo' }]]})

    expect(engine.getCellType(adr('A1'))).toBe(CellType.VALUE)
    expect(engine.getCellType(adr('B1'))).toBe(CellType.VALUE)
  })

  it('formula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SUM(1, 2)' }]]})

    expect(engine.getCellType(adr('A1'))).toBe(CellType.FORMULA)
  })

  it('formula matrix', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRANSPOSE(C1:C2)' }]]})

    expect(engine.getCellType(adr('A1'))).toBe(CellType.ARRAYFORMULA)
    expect(engine.getCellType(adr('B1'))).toBe(CellType.ARRAY)
  })

  it('parsing error is a formula cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SUM(' }]]})

    expect(engine.getCellType(adr('A1'))).toBe(CellType.FORMULA)
  })
})

describe('#getCellValueDetailedType', () => {
  it('string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.STRING)
  })

  it('number data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '42' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_RAW)
  })

  it('number currency', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '42$' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_CURRENCY)
  })

  it('number percent', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '42%' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_PERCENT)
  })

  it('number date', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '01/01/1967' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_DATE)
  })

  it('number datetime', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '01/01/1967 15:34' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_DATETIME)
  })

  it('number time', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '15:34' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_TIME)
  })

  it('boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE()' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.BOOLEAN)
  })

  it('empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: null }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.EMPTY)
    expect(engine.getCellValueDetailedType(adr('B1'))).toBe(CellValueDetailedType.EMPTY)
  })

  it('error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=1/0' }, { cellValue: '=SU()' }, { cellValue: '=A1' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.ERROR)
    expect(engine.getCellValueDetailedType(adr('B1'))).toBe(CellValueDetailedType.ERROR)
    expect(engine.getCellValueDetailedType(adr('C1'))).toBe(CellValueDetailedType.ERROR)
  })

  it('formula evaluating to range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=B1:B2' }, { cellValue: '=C:D' }]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.ERROR)
    expect(engine.getCellValueDetailedType(adr('B1'))).toBe(CellValueDetailedType.ERROR)
  })

  it('cell data with no metadata', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{cellValue: '42%'}]]})
    expect(engine.getCellValueDetailedType(adr('A1'))).toEqual(CellValueDetailedType.NUMBER_PERCENT)
  })
})

describe('#getCellValueFormat', () => {
  it('non-currency', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }]]})
    expect(engine.getCellValueFormat(adr('A1'))).toEqual(undefined)
  })

  it('currency', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1PLN' }]] }, {currencySymbol: ['PLN', '$']})
    expect(engine.getCellValueFormat(adr('A1'))).toEqual('PLN')
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValueDetailedType(adr('A1'))).toEqual(CellValueDetailedType.NUMBER_CURRENCY)
  })

  it('unicode currency', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1₪' }]] }, {currencySymbol: ['₪']})
    expect(engine.getCellValueFormat(adr('A1'))).toEqual('₪')
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValueDetailedType(adr('A1'))).toEqual(CellValueDetailedType.NUMBER_CURRENCY)
  })
})

describe('#getCellValueType', () => {
  it('string', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: 'foo' }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.STRING)
  })

  it('number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '42' }, { cellValue: '=SUM(1, A1)' }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.NUMBER)
    expect(engine.getCellValueType(adr('B1'))).toBe(CellValueType.NUMBER)
  })

  it('boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRUE()' }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.BOOLEAN)
  })

  it('empty value', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: null }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.EMPTY)
    expect(engine.getCellValueType(adr('B1'))).toBe(CellValueType.EMPTY)
  })

  it('error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=1/0' }, { cellValue: '=SU()' }, { cellValue: '=A1' }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.ERROR)
    expect(engine.getCellValueType(adr('B1'))).toBe(CellValueType.ERROR)
    expect(engine.getCellValueType(adr('C1'))).toBe(CellValueType.ERROR)
  })

  it('formula evaluating to range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=B1:B2' }, { cellValue: '=C:D' }]]})
    expect(engine.getCellValueType(adr('A1'))).toBe(CellValueType.ERROR)
    expect(engine.getCellValueType(adr('B1'))).toBe(CellValueType.ERROR)
  })

  it('cell data with no metadata', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{cellValue: '42%'}]]})
    expect(engine.getCellValueType(adr('A1'))).toEqual(CellValueType.NUMBER)
  })
})

describe('#doesCellHaveSimpleValue', () => {
  it('true', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }, { cellValue: 'foo' }]]})
    expect(engine.doesCellHaveSimpleValue(adr('A1'))).toEqual(true)
    expect(engine.doesCellHaveSimpleValue(adr('B1'))).toEqual(true)
  })

  it('false', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SUM(1, 2)' }, { cellValue: null }, { cellValue: '=TRANSPOSE(A1:A1)' }]]})
    expect(engine.doesCellHaveSimpleValue(adr('A1'))).toEqual(false)
    expect(engine.doesCellHaveSimpleValue(adr('B1'))).toEqual(false)
    expect(engine.doesCellHaveSimpleValue(adr('C1'))).toEqual(false)
  })
})

describe('#doesCellHaveFormula', () => {
  it('true', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=SUM(1, 2)' }]]})
    expect(engine.doesCellHaveFormula(adr('A1'))).toEqual(true)
  })

  it('false', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }, { cellValue: '' }, { cellValue: '{=TRANSPOSE(A1:A1)}' }, { cellValue: 'foo'}, {cellValue: null }]]})
    expect(engine.doesCellHaveFormula(adr('A1'))).toEqual(false)
    expect(engine.doesCellHaveFormula(adr('B1'))).toEqual(false)
    expect(engine.doesCellHaveFormula(adr('C1'))).toEqual(false)
    expect(engine.doesCellHaveFormula(adr('D1'))).toEqual(false)
    expect(engine.doesCellHaveFormula(adr('E1'))).toEqual(false)
  })

  it('arrayformula', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=ARRAYFORMULA(ISEVEN(B1:B2*2))' }]]})
    expect(engine.doesCellHaveFormula(adr('A1'))).toEqual(true)
  })
})

describe('#isCellEmpty', () => {
  it('true', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: null }, { cellValue: undefined }]]})
    expect(engine.isCellEmpty(adr('A1'))).toEqual(true)
    expect(engine.isCellEmpty(adr('B1'))).toEqual(true)
    expect(engine.isCellEmpty(adr('C1'))).toEqual(true)
  })

  it('false', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }, { cellValue: '=SUM(1, 2)' }, { cellValue: '{=TRANSPOSE(A1:A1)}' }, { cellValue: 'foo'}]]})
    expect(engine.isCellEmpty(adr('A1'))).toEqual(false)
    expect(engine.isCellEmpty(adr('B1'))).toEqual(false)
    expect(engine.isCellEmpty(adr('C1'))).toEqual(false)
    expect(engine.isCellEmpty(adr('D1'))).toEqual(false)
  })
})

describe('#isCellPartOfArray', () => {
  it('true', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=TRANSPOSE(B1:C1)' }]]})
    expect(engine.isCellPartOfArray(adr('A1'))).toEqual(true)
  })

  it('false', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1' }, { cellValue: '' }, { cellValue: '=SUM(1, 2)' }, { cellValue: 'foo'}]]})
    expect(engine.isCellPartOfArray(adr('A1'))).toEqual(false)
    expect(engine.isCellPartOfArray(adr('B1'))).toEqual(false)
    expect(engine.isCellPartOfArray(adr('C1'))).toEqual(false)
    expect(engine.isCellPartOfArray(adr('D1'))).toEqual(false)
  })
})

describe('dateTime', () => {
  it('dateTime', () => {
    const [engine] = HyperFormula.buildEmpty()
    expect(engine.numberToDateTime(43845.1)).toEqual({
      'day': 15,
      'hours': 2,
      'minutes': 24,
      'month': 1,
      'seconds': 0,
      'year': 2020
    })
    expect(engine.numberToDate(43845)).toEqual({'day': 15, 'month': 1, 'year': 2020})
    expect(engine.numberToTime(1.1)).toEqual({'hours': 26, 'minutes': 24, 'seconds': 0})
  })
})

describe('Graph dependency topological ordering module', () => {
  it('should build correctly when rows are dependant on cells that are not yet processed #1', () => {
    expect(() => HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=A3+A2' }],
      [{ cellValue: '=A3' }],
    ]})).not.toThrowError()
  })

  it('should build correctly when rows are dependant on cells that are not yet processed #2', () => {
    expect(() => HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=A4+A3+A2' }],
      [{ cellValue: '=A4+A3' }],
      [{ cellValue: '=A4' }],
    ]})).not.toThrowError()
  })

  it('should build correctly when rows are dependant on cells that are not yet processed #3', () => {
    expect(() => HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=A5+A4+A3+A2' }],
      [{ cellValue: '=A5+A4+A3' }],
      [{ cellValue: '=A5+A4' }],
      [{ cellValue: '=A5' }],
    ]})).not.toThrowError()
  })
})


const mapToCellData = (values: any[][]) => ({ cells: values.map(x => x.map(z => new CellData(z))) })
const mapFromCellData = (cellData: (DataRawCellContent | CellData<any>)[][]) => cellData.map(x => x.map(z => z.cellValue))

describe('#getFillRangeData from corner source', () => {
  it('should properly apply wrap-around #1', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('C3'), 3, 3))
    )).toEqual([['2', '=$A$1', '2'], ['=A3', 1, '=C3'], ['2', '=$A$1', '2']])
  })

  it('should properly apply wrap-around #2', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('B2'), 3, 3))
    )).toEqual([[1, '=A1', 1], ['=$A$1', '2', '=$A$1'], [1, '=A3', 1]])
  })

  it('should properly apply wrap-around #3', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('A1'), 3, 3))
    )).toEqual([['2', '=$A$1', '2'], ['=#REF!', 1, '=A1'], ['2', '=$A$1', '2']])
  })
})

describe('#getFillRangeData from target source', () => {
  it('should properly apply wrap-around #1', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('C3'), 3, 3), true)
    )).toEqual([[1, '=B2', 1], ['=$A$1', '2', '=$A$1'], [1, '=B4', 1]])
  })

  it('should properly apply wrap-around #2', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('B2'), 3, 3), true)
    )).toEqual([[1, '=A1', 1], ['=$A$1', '2', '=$A$1'], [1, '=A3', 1]])
  })

  it('should properly apply wrap-around #3', () => {
    const [engine] = HyperFormula.buildFromArray(mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]))

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2'), 2, 2), AbsoluteCellRange.spanFrom(adr('A1'), 3, 3), true)
    )).toEqual([[1, '=#REF!', 1], ['=$A$1', '2', '=$A$1'], [1, '=#REF!', 1]])
  })
})

describe('#getFillRangeData', () => {
  it('should move between sheets - sheet relative addresses', () => {
    const [engine] = HyperFormula.buildFromSheets({
        'Sheet1': mapToCellData([[], [undefined, 1, '=A1'], [undefined, '=$A$1', '2']]),
        'Sheet2': { cells: [] },
      }
    )

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2', 0), 2, 2), AbsoluteCellRange.spanFrom(adr('C3', 1), 3, 3))
    )).toEqual([['2', '=$A$1', '2'], ['=A3', 1, '=C3'], ['2', '=$A$1', '2']])
  })

  it('should move between sheets - sheet absolute addresses', () => {
    const [engine] = HyperFormula.buildFromSheets({
        'Sheet1': mapToCellData([[], [undefined, 1, '=Sheet1!A1'], [undefined, '=Sheet2!$A$1', '2']]),
        'Sheet2': { cells: [] },
      }
    )

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2', 0), 2, 2), AbsoluteCellRange.spanFrom(adr('C3', 1), 3, 3))
    )).toEqual([['2', '=Sheet2!$A$1', '2'], ['=Sheet1!A3', 1, '=Sheet1!C3'], ['2', '=Sheet2!$A$1', '2']])
  })

  it('should move between sheets - no sheet of a given name', () => {
    const [engine] = HyperFormula.buildFromSheets({
        'Sheet1': { cells: [],
      }
    })

    expect(mapFromCellData(engine.getFillRangeData(AbsoluteCellRange.spanFrom(adr('B2', 0), 1, 1), AbsoluteCellRange.spanFrom(adr('C3', 1), 1, 1))
    )).toEqual([[null]])
  })

})
