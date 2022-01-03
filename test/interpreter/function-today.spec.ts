import {HyperFormula} from '../../src'
import {CellValueDetailedType, ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - function TODAY', () => {
  let originalNow: () => number

  beforeEach(() => {
    originalNow = Date.now
    let cnt = 20
    Date.now = () => {
      cnt += 1
      return Date.parse(`1985-08-16T03:45:${cnt}`)
    }
  })

  it('works', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TODAY()' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(31275)
    expect(engine.getCellValueDetailedType(adr('A1'))).toBe(CellValueDetailedType.NUMBER_DATE)
  })

  it('works #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=YEAR(TODAY())' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1985)
  })

  it('works #3', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=MONTH(TODAY())' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(8)
  })

  it('works #4', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=DAY(TODAY())' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(16)
  })

  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TODAY(42)' }],
    ])

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  afterEach(() => {
    Date.now = originalNow
  })
})
