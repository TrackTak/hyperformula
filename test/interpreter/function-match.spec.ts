import {ErrorType, HyperFormula} from '../../src'
import {DependencyGraph} from '../../src/DependencyGraph'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function MATCH', () => {
  it('validates number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(1)' }],
      [{ cellValue: '=MATCH(1, B1:B3, 0, 42)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('validates that 1st argument is number, string or boolean', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(C2:C3, B1:B1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
  })

  it('2nd argument can be a scalar', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(42, 42)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('validates that 3rd argument is number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(0, B1:B1, "a")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('should propagate errors properly', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(1/0, B1:B1)' }],
      [{ cellValue: '=MATCH(1, B1:B1, 1/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('column - works when value is in first cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:A5, 0)' }],
      [{ cellValue: '103' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('column - works when value is in the last cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:A5, 0)' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '103' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('column - returns the position in the range, not the row number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(102, A6:A9, 0)' }],
      [{ cellValue: '' }],
      [{ cellValue: '' }],
      [{ cellValue: '' }],
      [{ cellValue: '' }],
      [{ cellValue: '100' }],
      [{ cellValue: '101' }],
      [{ cellValue: '102' }],
      [{ cellValue: '103' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('column - returns first result', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:A5, 0)' }],
      [{ cellValue: '200' }],
      [{ cellValue: '103' }],
      [{ cellValue: '103' }],
      [{ cellValue: '200' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('column - doesnt return result if value after searched range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:A5, 0)' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '103' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('column - doesnt return result if value before searched range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A3:A5, 0)' }],
      [{ cellValue: '103' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
      [{ cellValue: '200' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('row - works when value is in first cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:D2, 0)' }],
      [{ cellValue: '103' }, { cellValue: '200' }, { cellValue: '200' }, { cellValue: '200'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('row - works when value is in the last cell', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:D2, 0)' }],
      [{ cellValue: '200' }, { cellValue: '200' }, { cellValue: '200' }, { cellValue: '103'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('row - returns the position in the range, not the column number', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(102, E2:H2, 0)' }],
      [{ cellValue: '' }, { cellValue: '' }, { cellValue: '' }, { cellValue: ''}, {cellValue: '100' }, { cellValue: '101' }, { cellValue: '102' }, { cellValue: '103' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('row - returns first result', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:D2, 0)' }],
      [{ cellValue: '200' }, { cellValue: '103' }, { cellValue: '103' }, { cellValue: '200'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('row - doesnt return result if value after searched range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, A2:D2, 0)' }],
      [{ cellValue: '200' }, { cellValue: '200' }, { cellValue: '200' }, { cellValue: '200'}, {cellValue: '103' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('row - doesnt return result if value before searched range', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(103, B2:D2, 0)' }],
      [{ cellValue: '103' }, { cellValue: '200' }, { cellValue: '200' }, { cellValue: '200'}],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('uses binsearch', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = spyOn(DependencyGraph.prototype as any, 'computeListOfValuesInRange')

    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(400, A2:A5, 1)' }],
      [{ cellValue: '100' }],
      [{ cellValue: '200' }],
      [{ cellValue: '300' }],
      [{ cellValue: '400' }],
      [{ cellValue: '500' }],
    ]})

    expect(spy).not.toHaveBeenCalled()
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('uses indexOf', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = spyOn(DependencyGraph.prototype as any, 'computeListOfValuesInRange')

    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(400, A2:A5, 0)' }],
      [{ cellValue: '100' }],
      [{ cellValue: '200' }],
      [{ cellValue: '300' }],
      [{ cellValue: '400' }],
      [{ cellValue: '500' }],
    ]})

    expect(spy).toHaveBeenCalled()
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('returns lower bound match for sorted data', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(203, A2:A5, 1)' }],
      [{ cellValue: '100' }],
      [{ cellValue: '200' }],
      [{ cellValue: '300' }],
      [{ cellValue: '400' }],
      [{ cellValue: '500' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
  })

  it('should coerce empty arg to 0', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '-5' }],
      [{ cellValue: '-2' }],
      [{ cellValue: '0' }],
      [{ cellValue: '2' }],
      [{ cellValue: '5' }],
      [{ cellValue: '=MATCH(0, A1:A5)' }],
      [{ cellValue: '=MATCH(, A1:A5)' }],
    ]})

    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(3)
  })

  it('should return NA when range is not a single column or row', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '0' }, { cellValue: '1' }],
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=MATCH(0, A1:B2)' }],
    ]})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA))
  })

  it('should properly report no match', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH("0", A2:A5)' }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      [{ cellValue: '\'1' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('should properly report approximate match', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH("2", A2:A5)' }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      [{ cellValue: '\'1' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
  })

  it('should coerce null to zero when using naive approach', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH(, A2:A4, 0)' }],
      [{ cellValue: 1 }],
      [{ cellValue: 3 }],
      [{ cellValue: 0 }],
    ] }, {useColumnIndex: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
  })

  it('works for strings, is not case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH("A", A2:A5, 0)' }],
      [{ cellValue: 'a' }],
      [{ cellValue: 'A' }],
    ] }, {caseSensitive: false})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })

  it('works for strings, is not case sensitive even if config defines case sensitivity', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=MATCH("A", A2:A5, 0)' }],
      [{ cellValue: 'a' }],
      [{ cellValue: 'A' }],
    ] }, {caseSensitive: true})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
  })
})
