import {ErrorType, HyperFormula} from '../../src'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function SUMXMY2', () => {
  it('should validate number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMXMY2(1)' }],
      [{ cellValue: '=SUMXMY2(1,2,3)' }]
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should return correct output', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMXMY2(A2:D2, A3:D3)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}],
      [{ cellValue: 5 }, { cellValue: 4 }, { cellValue: 2 }, { cellValue: 1}],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(30)
  })

  it('should validate that ranges are of equal length', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMXMY2(A2:F2, A3:E3)' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.EqualLength))
  })

  it('should propagate errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMXMY2(A2:E2, A3:E3)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '=NA()'}, {cellValue: 5 }, { cellValue: 6 }],
      [{ cellValue: 5 }, { cellValue: 4 }, { cellValue: 2 }, { cellValue: 1}, {cellValue: 5 }, { cellValue: 10 }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  it('should ignore non-number inputs', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMXMY2(A2:D2, A3:D3)' }],
      [{ cellValue:null }, { cellValue:2 }, { cellValue:'\'1' }, { cellValue:4 }],
      [{ cellValue:5 }, { cellValue:'\'abcd' }, { cellValue:2 }, { cellValue:true }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
  })
})
