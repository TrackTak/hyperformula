import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {SimpleDateTime} from '../../src/DateTimeHelper'
import {ErrorMessage} from '../../src/error-message'
import {defaultStringifyDateTime} from '../../src/format/format'
import {Maybe} from '../../src/Maybe'
import {adr, detailedError} from '../testUtils'

describe('Text', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '2' },
      { cellValue: '=TEXT(A1, "mm/dd/yyyy")' },
    ]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('01/01/1900')
  })

  it('wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TEXT(42)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('wrong format argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TEXT(2, 42)' }],
      [{ cellValue: '=TEXT(2, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('42')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('2')
  })

  it('wrong date argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TEXT(TRUE(), "mm/dd/yyyy")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('12/31/1899')
  })

  it('day formats', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '=DATE(2018, 8, 8)'},
      { cellValue: '=TEXT(A1, "d d")' },
      { cellValue: '=TEXT(A1, "dd DD")'},
    ]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('8 8')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('08 08')
  })

  it('month formats', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '=DATE(2018, 8, 8)' },
      { cellValue: '=TEXT(A1, "m M")' },
      { cellValue: '=TEXT(A1, "mm MM")' },
    ]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('8 0') //heuristic - repeated month is minutes
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('08 00') //heuristic - repeated month is minutes
  })

  it('year formats', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '=DATE(2018, 8, 8)'},
      { cellValue: '=TEXT(A1, "yy YY")'},
      { cellValue: '=TEXT(A1, "yyyy YYYY")'},
    ]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('18 18')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('2018 2018')
  })

  it('12 hours', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [
        { cellValue: '8/8/2018 14:00'},
        { cellValue: '=TEXT(A1, "hh:mm A/P")'},
      ],
      [
        { cellValue: '8/8/2018 00:30'},
        { cellValue: '=TEXT(A2, "hh:mm AM/PM")'},
      ],
      [{ cellValue: '8/8/2018 00:30' }, { cellValue: '=TEXT(A3, "hh:mm am/pm")' }],
      [
        { cellValue: '8/8/2018 00:30'},
        { cellValue: '=TEXT(A4, "hh:mm a/p")'},
      ]
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('02:00 P')
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual('12:30 AM')
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual('12:30 am')
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual('12:30 a')
  })

  it('24 hours', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [
        { cellValue: '8/8/2018 13:59'},
        { cellValue: '=TEXT(A1, "HH:mm")'},
      ]
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('13:59')
  })

  it('padding', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [
        { cellValue: '8/8/2018 01:01:01'}, { cellValue:'=TEXT(A1, "H:m:s")'},
      ],
      [
        { cellValue: '8/8/2018 01:11:11'}, { cellValue:'=TEXT(A2, "H:m:s")'},
      ]
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('1:1:1')
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual('1:11:11')
  })

  it('fractions of seconds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [
        { cellValue: '0.0000011574074074074074'}, { cellValue:'=TEXT(A1, "hh:mm:ss.ss")'},
      ],
      [{ cellValue: '0.000001' }, { cellValue: '=TEXT(A2, "hh:mm:ss.sss")' }]
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('00:00:00.1')
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual('00:00:00.086')
  })

  it('distinguishes between months and minutes - not supported', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '=DATE(2018, 8, 8)'},
      { cellValue: '=TEXT(A1, "mm")'},
      { cellValue: '=TEXT(A1, "HH:mm")'},
      { cellValue: '=TEXT(A1, "H:m")'},
    ]]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('08')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('00:00')
    expect(engine.getCellValue(adr('D1')).cellValue).toEqual('0:0')
  })

  it('works for number format', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '12.45'},
      { cellValue: '=TEXT(A1, "###.###")'},
      { cellValue: '=TEXT(A1, "000.000")'},
    ]]})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('12.45')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('012.450')
  })

})

describe('time duration', () => {
  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '0.1' }, { cellValue: '=TEXT(A1, "[hh]:mm:ss")' }],
      [{ cellValue: '1.1' }, { cellValue: '=TEXT(A2, "[hh]:mm:ss")' }],
      [{ cellValue: '0.1' }, { cellValue: '=TEXT(A3, "[mm]:ss")' }],
      [{ cellValue: '1.1' }, { cellValue: '=TEXT(A4, "[mm]:ss")' }],
      [{ cellValue: '0.1111' }, { cellValue: '=TEXT(A5, "[mm]:ss.ss")' }],
      [{ cellValue: '0.1111' }, { cellValue: '=TEXT(A6, "[mm]:ss.00")' }],
    ]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('02:24:00')
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual('26:24:00')
    expect(engine.getCellValue(adr('B3')).cellValue).toEqual('144:00')
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual('1584:00')
    expect(engine.getCellValue(adr('B5')).cellValue).toEqual('159:59.04')
    expect(engine.getCellValue(adr('B6')).cellValue).toEqual('159:59.04')
  })
})

describe('Custom date printing', () => {
  function customPrintDate(date: SimpleDateTime, dateFormat: string): Maybe<string> {
    const str = defaultStringifyDateTime(date, dateFormat)
    if (str === undefined) {
      return undefined
    } else {
      return 'fancy ' + str + ' fancy'
    }
  }

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '2'},
      { cellValue: '=TEXT(A1, "mm/dd/yyyy")'},
    ]] }, {stringifyDateTime: customPrintDate})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('fancy 01/01/1900 fancy')
  })

  it('no effect for number format', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[
      { cellValue: '12.45'},
      { cellValue: '=TEXT(A1, "###.###")'},
      { cellValue: '=TEXT(A1, "000.000")'},
    ]] }, {stringifyDateTime: customPrintDate})

    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('12.45')
    expect(engine.getCellValue(adr('C1')).cellValue).toEqual('012.450')
  })

  it('date printing, month and minutes', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '1.1' }, { cellValue: '=TEXT(A1, "mm-dd mm:ss.sssss")' }],
      [{ cellValue: '1.222' }, { cellValue: '=TEXT(A2, "mm-dd mm:ss.sssss")' }]]})
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual('12-31 24:00')
    expect(engine.getCellValue(adr('B2')).cellValue).toEqual('12-31 19:40.8')
  })
})
