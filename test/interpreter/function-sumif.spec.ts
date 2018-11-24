import {HandsOnEngine} from '../../src'
import {cellError, ErrorType} from '../../src/Cell'

describe('Function SUMIF', () => {
  let engine: HandsOnEngine

  beforeEach(() => {
    engine = new HandsOnEngine()
  })

  it('error when 1st arg is not a range or reference', () => {
    engine.loadSheet([
      ['=SUMIF(42; ">0"; B1:B2)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('error when 2nd arg is not a string', () => {
    engine.loadSheet([
      ['=SUMIF(C1:C2; 78; B1:B2)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('error when 3rd arg is not a range or reference', () => {
    engine.loadSheet([
      ['=SUMIF(C1:C2; ">0"; 42)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('error when criterion unparsable', () => {
    engine.loadSheet([
      ['=SUMIF(B1:B2; "%"; C1:C2)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
  })

  it('error when different width dimension of arguments', () => {
    engine.loadSheet([
      ['=SUMIF(B1:C1; ">0"; B2:D2)'],
      ['=SUMIF(B1; ">0"; B2:D2)'],
      ['=SUMIF(B1:D1; ">0"; B2)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
    expect(engine.getCellValue('A2')).toEqual(cellError(ErrorType.VALUE))
    expect(engine.getCellValue('A3')).toEqual(cellError(ErrorType.VALUE))
  })

  it('error when different height dimension of arguments', () => {
    engine.loadSheet([
      ['=SUMIF(B1:B2; ">0"; C1:C3)'],
      ['=SUMIF(B1; ">0"; C1:C2)'],
      ['=SUMIF(B1:B2; ">0"; C1)'],
    ])

    expect(engine.getCellValue('A1')).toEqual(cellError(ErrorType.VALUE))
    expect(engine.getCellValue('A2')).toEqual(cellError(ErrorType.VALUE))
    expect(engine.getCellValue('A3')).toEqual(cellError(ErrorType.VALUE))
  })

  it('usage of greater than operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A3; ">1"; B1:B3)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(7)
  })

  it('usage of greater than or equal operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A3; ">=1"; B1:B3)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(12)
  })

  it('usage of less than operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A2; "<1"; B1:B2)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(3)
  })

  it('usage of less than or equal operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A3; "<=1"; B1:B3)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(8)
  })

  it('usage of equal operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A3; "=1"; B1:B3)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(5)
  })

  it('usage of not equal operator', () => {
    engine.loadSheet([
      ['0', '3'],
      ['1', '5'],
      ['2', '7'],
      ['=SUMIF(A1:A3; "<>1"; B1:B3)'],
    ])

    expect(engine.getCellValue('A4')).toEqual(10)
  })

  it('works when arguments are just references', () => {
    engine.loadSheet([
      ['2', '3'],
      ['=SUMIF(A1; ">1"; B1)'],
    ])

    expect(engine.getCellValue('A2')).toEqual(3)
  })
})