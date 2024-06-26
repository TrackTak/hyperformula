import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COMBIN', () => {
  it('checks number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(1)' }, { cellValue: '=COMBIN(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(0,0)' }],
      [{ cellValue: '=COMBIN(1,0)' }],
      [{ cellValue: '=COMBIN(4,2)' }],
      [{ cellValue: '=COMBIN(9,6)' }],
      [{ cellValue: '=COMBIN(20,10)' }],
      [{ cellValue: '=COMBIN(30,10)' }],
      [{ cellValue: '=COMBIN(40,10)' }],
      [{ cellValue: '=COMBIN(100,99)' }],
      [{ cellValue: '=COMBIN(100,8)' }],
      [{ cellValue: '=COMBIN(1029,512)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(6)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(84)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(184756)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(30045015)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(847660528)
    expect(engine.getCellValue(adr('A8')).cellValue).toBe(100)
    expect(engine.getCellValue(adr('A9')).cellValue).toBe(186087894300)
    expect(engine.getCellValue(adr('A10')).cellValue as number / 1.41325918108873e+308).toBeCloseTo(1, 6)
  })

  it('truncates argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(9.9,6.6)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(84)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(1.1, 1.2)' }],
      [{ cellValue: '=COMBIN(1, 2)' }],
      [{ cellValue: '=COMBIN(2, -1)' }],
      [{ cellValue: '=COMBIN(-1, -1)' }],
      [{ cellValue: '=COMBIN(1030, 0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.WrongOrder))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.WrongOrder))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    //inconsistency with product #2
    expect(engine.getCellValue(adr('A5')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('uses coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(TRUE(),"0")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBIN(NA(), NA())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
