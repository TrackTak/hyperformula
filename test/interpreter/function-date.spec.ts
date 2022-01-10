import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {Config} from '../../src/Config'
import {ErrorMessage} from '../../src/error-message'
import {adr, dateNumberToString, detailedError} from '../testUtils'

describe('Function DATE', () => {
  it('with 3 numerical arguments', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900, 1, 1)' }, { cellValue: '=DATE(1900, 1, 2)' }, { cellValue: '=DATE(1915, 10, 24)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_DATE)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('01/01/1900')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
    expect(dateNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('02/01/1900')
    expect(dateNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('24/10/1915')
  })

  it('truncation', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900.9, 1, 1)' }, { cellValue: '=DATE(1900, 1.9, 2)' }, { cellValue: '=DATE(1915, 10, 24.9)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('01/01/1900')
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(3)
    expect(dateNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('02/01/1900')
    expect(dateNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('24/10/1915')
  })

  it('negative', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(-1900, 1, 1)' }, { cellValue: '=DATE(1901, -1, 2)' }, { cellValue: '=DATE(2000,-13,2)' }, { cellValue: '=DATE(1915, 10, -24)'}, {cellValue: '=DATE(1900, 1, -100000)' }, { cellValue: '=DATE(1900, 1, -200000)' }, { cellValue: '=DATE(-1,1,1)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.InvalidDate))
    expect(dateNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('02/11/1900')
    expect(dateNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('02/11/1998')
    expect(dateNumberToString(engine.getCellValue(adr('D1')).cellValue, config)).toEqual('06/09/1915')
    expect(engine.getCellValue(adr('E1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DateBounds))
    expect(engine.getCellValue(adr('F1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DateBounds))
    expect(engine.getCellValue(adr('G1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.DateBounds))
  })

  it('rollover', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900, 14, 28)' }, { cellValue: '=DATE(1900, 14, 29)' }, { cellValue: '=DATE(1915, 100, 1000)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('28/02/1901')
    expect(dateNumberToString(engine.getCellValue(adr('B1')).cellValue, config)).toEqual('01/03/1901')
    expect(dateNumberToString(engine.getCellValue(adr('C1')).cellValue, config)).toEqual('25/12/1925')
  })

  it('number of arguments', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900, 1)' }],
      [{ cellValue: '=DATE(1900, 1, 1, 1)' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with incoercible argument', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE("foo", 1, 1)' }],
      [{ cellValue: '=DATE(1900, "foo", 1)' }],
      [{ cellValue: '=DATE(1900, 1, "foo")' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('with coercible argument', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '="2000"' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=DATE(A1, 1, 1)' }],
      [{ cellValue: '=DATE(2000, B1, 1)' }],
      [{ cellValue: '=DATE(2000, 1, B1)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('01/01/2000')
    expect(dateNumberToString(engine.getCellValue(adr('A3')).cellValue, config)).toEqual('01/01/2000')
    expect(dateNumberToString(engine.getCellValue(adr('A4')).cellValue, config)).toEqual('01/01/2000')
  })

  it('precedence of errors', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(FOOBAR(), 4/0, 1)' }],
      [{ cellValue: '=DATE(2000, FOOBAR(), 4/0)' }],
      [{ cellValue: '=DATE(2000, 1, FOOBAR())' }],
    ]}, config)
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOOBAR')))
  })
})

describe('Function DATE + leap years', () => {
  it('should support nonleap year 2001 ', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(2001,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('01/03/2001')
  })

  it('should support leap year 2016', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(2016,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('29/02/2016')
  })

  it('should support leap year 1920', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1920,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('29/02/1920')
  })

  it('should support nonleap year 1900', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('01/03/1900')
  })

  it('should support nonleap year 1900 with excel compatibility', () => {
    const config = new Config({leapYear1900: true})
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(1900,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('29/02/1900')
  })

  it('should support leap year 2400', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(2400,02,29)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('29/02/2400')
  })

  it('small year values', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(0,02,29)' }],
      [{ cellValue: '=DATE(1800,02,28)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('01/03/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('28/02/3700')
  })

  it('different nullDate', () => {
    const config = new Config({nullDate: {year: 1900, day: 1, month: 1}})
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(0,02,28)' }],
      [{ cellValue: '=DATE(1800,02,28)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('28/02/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('28/02/3700')
  })

  it('should be leap1900 sensitive', () => {
    const config = new Config({leapYear1900: true})
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(10,03,03)' }],
      [{ cellValue: '=DATE(1800,02,28)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('03/03/1909')
    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('28/02/3699')
  })

  it('different nullDate, leap1900 sensitive', () => {
    const config = new Config({nullDate: {year: 1899, day: 31, month: 12}, leapYear1900: true})
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE(0,02,28)' }],
      [{ cellValue: '=DATE(0,02,29)' }],
      [{ cellValue: '=DATE(1800,02,28)' }],
    ]}, config)
    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqual('28/02/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('29/02/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A3')).cellValue, config)).toEqual('28/02/3700')
  })

  it('should throw a error in the absence of arguments', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATE()' }],
    ]}, config)

    expect(dateNumberToString(engine.getCellValue(adr('A1')).cellValue, config)).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('with blanks', () => {
    const config = new Config()
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: null }, { cellValue: '' }, { cellValue: 'string' }, { cellValue: null }, { cellValue: '\'' }],
      [{ cellValue: '=DATE(A1, 2, 3)' }],
      [{ cellValue: '=DATE(B1, 2, 3)' }],
      [{ cellValue: '=DATE(C1, 2, 3)' }],
      [{ cellValue: '=DATE(D1, 2, 3)' }],
      [{ cellValue: '=DATE(E1, 2, 3)' }],
    ]}, config)

    expect(dateNumberToString(engine.getCellValue(adr('A2')).cellValue, config)).toEqual('03/02/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A3')).cellValue, config)).toEqual('03/02/1900')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(dateNumberToString(engine.getCellValue(adr('A5')).cellValue, config)).toEqual('03/02/1900')
    expect(dateNumberToString(engine.getCellValue(adr('A6')).cellValue, config)).toEqual('03/02/1900')
  })
})
