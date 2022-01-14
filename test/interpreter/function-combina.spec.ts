import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COMBINA', () => {
  it('checks number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(1)' }, { cellValue: '=COMBINA(1, 2, 3)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(0,0)' }],
      [{ cellValue: '=COMBINA(1,0)' }],
      [{ cellValue: '=COMBINA(2,2)' }],
      [{ cellValue: '=COMBINA(0,2)' }],
      [{ cellValue: '=COMBINA(10,10)' }],
      [{ cellValue: '=COMBINA(20,10)' }],
      [{ cellValue: '=COMBINA(30,10)' }],
      [{ cellValue: '=COMBINA(100,500)' }],
      [{ cellValue: '=COMBINA(100,8)' }],
      [{ cellValue: '=COMBINA(518,512)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toBe(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(92378)
    expect(engine.getCellValue(adr('A6')).cellValue).toBe(20030010)
    expect(engine.getCellValue(adr('A7')).cellValue).toBe(635745396)
    expect(engine.getCellValue(adr('A8')).cellValue as number / 1.8523520317769801e+115).toBeCloseTo(1, 6)
    expect(engine.getCellValue(adr('A9')).cellValue).toBe(325949656825)
    expect(engine.getCellValue(adr('A10')).cellValue as number / 1.41325918108873e+308).toBeCloseTo(1, 6)
  })

  it('truncates argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(9.9,6.6)' }],
      [{ cellValue: '=COMBINA(518, 512.9)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(3003)
    expect(engine.getCellValue(adr('A2')).cellValue as number / 1.41325918108873e+308).toBeCloseTo(1)
  })

  it('checks bounds', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(2, -1)' }],
      [{ cellValue: '=COMBINA(-1, 2)' }],
      [{ cellValue: '=COMBINA(1031, 0)' }],
      [{ cellValue: '=COMBINA(518, 513)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(engine.getCellValue(adr('A4')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('uses coercion', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(TRUE(),"0")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
  })

  it('propagates error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMBINA(NA(), NA())' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })
})
