import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function COMPLEX', () => {
  it('should return error for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMPLEX(1)' }],
      [{ cellValue: '=COMPLEX(1, 2, 3, 4)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return error for arguments of wrong type', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMPLEX("foo", 2)' }],
      [{ cellValue: '=COMPLEX(1, "bar")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should work', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMPLEX(0, 0)' }],
      [{ cellValue: '=COMPLEX(0, 1)' }],
      [{ cellValue: '=COMPLEX(0, -1)' }],
      [{ cellValue: '=COMPLEX(0, 2)' }],
      [{ cellValue: '=COMPLEX(0, -2)' }],
      [{ cellValue: '=COMPLEX(1, 0)' }],
      [{ cellValue: '=COMPLEX(1, 1)' }],
      [{ cellValue: '=COMPLEX(1, -1)' }],
      [{ cellValue: '=COMPLEX(1, 2)' }],
      [{ cellValue: '=COMPLEX(1, -2)' }],
      [{ cellValue: '=COMPLEX(-1, 0)' }],
      [{ cellValue: '=COMPLEX(-1, 1)' }],
      [{ cellValue: '=COMPLEX(-1, -1)' }],
      [{ cellValue: '=COMPLEX(-1, 2)' }],
      [{ cellValue: '=COMPLEX(-1, -2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('0')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('i')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual('-i')
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual('2i')
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual('-2i')
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual('1')
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual('1+i')
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual('1-i')
    expect(engine.getCellValue(adr('A9')).cellValue).toEqual('1+2i')
    expect(engine.getCellValue(adr('A10')).cellValue).toEqual('1-2i')
    expect(engine.getCellValue(adr('A11')).cellValue).toEqual('-1')
    expect(engine.getCellValue(adr('A12')).cellValue).toEqual('-1+i')
    expect(engine.getCellValue(adr('A13')).cellValue).toEqual('-1-i')
    expect(engine.getCellValue(adr('A14')).cellValue).toEqual('-1+2i')
    expect(engine.getCellValue(adr('A15')).cellValue).toEqual('-1-2i')
  })

  it('should work with third argument', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=COMPLEX(1, 1, "i")' }],
      [{ cellValue: '=COMPLEX(1, 1, "j")' }],
      [{ cellValue: '=COMPLEX(1, 1, "k")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1+i')
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual('1+j')
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ShouldBeIorJ))
  })
})
