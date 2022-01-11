import GPU from 'gpu.js'
import {ErrorType, HyperFormula} from '../../src'
import {ConfigParams} from '../../src/Config'
import {ErrorMessage} from '../../src/error-message'
import {MatrixPlugin} from '../../src/interpreter/plugin/MatrixPlugin'
import {adr, detailedError, detailedErrorWithOrigin} from '../testUtils'

describe('Matrix plugin', () => {
  beforeAll(() => {
    HyperFormula.registerFunctionPlugin(MatrixPlugin)
  })

  const sharedExamples = (config: Partial<ConfigParams>) => {
    it('matrix multiplication', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '=MMULT(A1:B3,A4:B5)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(7)
      expect(engine.getCellValue(adr('B6')).cellValue).toBeCloseTo(10)
      expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(15)
      expect(engine.getCellValue(adr('B7')).cellValue).toBeCloseTo(22)
      expect(engine.getCellValue(adr('A8')).cellValue).toBeCloseTo(23)
      expect(engine.getCellValue(adr('B8')).cellValue).toBeCloseTo(34)
    })

    it('matrix multiplication wrong size', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '7' }, { cellValue: '8' }, { cellValue: '9' }],
        [{ cellValue: '=mmult(A1:B3,A4:C6)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A7')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ArrayDimensions))
      expect(engine.getCellValue(adr('B7')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ArrayDimensions))
    })

    it('matrix multiplication with string in data', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=MMULT(A1:B2,A3:B4)' }],
        [{ cellValue: '3' }, { cellValue: 'foo' }],
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=MMULT(A3:B4,A1:B2)' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
      ]}, config)

      expect(engine.getCellValue(adr('C1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('D1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('D2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('C3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('D4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('C3')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
      expect(engine.getCellValue(adr('D4')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberRange))
    })

    it('nested matrix multiplication', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '=MMULT(A1:B2, MMULT(A1:B2,A1:B2))' }],
      ]}, config)

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual(37)
      expect(engine.getCellValue(adr('B3')).cellValue).toEqual(54)
      expect(engine.getCellValue(adr('A4')).cellValue).toEqual(81)
      expect(engine.getCellValue(adr('B4')).cellValue).toEqual(118)
    })

    it('mmult of other mmult', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=MMULT(A1:B2, A1:B2)' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '=MMULT(A1:B2, C1:D2)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual(37)
      expect(engine.getCellValue(adr('B3')).cellValue).toEqual(54)
      expect(engine.getCellValue(adr('A4')).cellValue).toEqual(81)
      expect(engine.getCellValue(adr('B4')).cellValue).toEqual(118)
    })

    it('mmult of a number', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '=MMULT(3, 4)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    })

    it('mmult wrong number of arguments', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '=MMULT(0)' }, { cellValue: '=MMULT(0,0,0)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
      expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('matrix multiplication by sumproduct', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: '3' }, { cellValue: '4' }],
        [{ cellValue: '=SUMPRODUCT($A1:$B1,transpose(A$4:A$5))' }, { cellValue: '=SUMPRODUCT($A1:$B1,transpose(B$4:B$5))' }],
        [{ cellValue: '=SUMPRODUCT($A2:$B2,transpose(A$4:A$5))' }, { cellValue: '=SUMPRODUCT($A2:$B2,transpose(B$4:B$5))' }],
        [{ cellValue: '=SUMPRODUCT($A3:$B3,transpose(A$4:A$5))' }, { cellValue: '=SUMPRODUCT($A3:$B3,transpose(B$4:B$5))' }],
      ]}, config)

      expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(7)
      expect(engine.getCellValue(adr('B6')).cellValue).toBeCloseTo(10)
      expect(engine.getCellValue(adr('A7')).cellValue).toBeCloseTo(15)
      expect(engine.getCellValue(adr('B7')).cellValue).toBeCloseTo(22)
      expect(engine.getCellValue(adr('A8')).cellValue).toBeCloseTo(23)
      expect(engine.getCellValue(adr('B8')).cellValue).toBeCloseTo(34)
    })

    it('matrix maxpool', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4'}, {cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '11' }, { cellValue: '12' }, { cellValue: '13' }, { cellValue: '14'}, {cellValue: '15' }, { cellValue: '16' }],
        [{ cellValue: '21' }, { cellValue: '22' }, { cellValue: '23' }, { cellValue: '24'}, {cellValue: '25' }, { cellValue: '26' }],
        [{ cellValue: '=maxpool(A1:F3,3)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(23)
      expect(engine.getCellValue(adr('B4')).cellValue).toBeCloseTo(26)
    })

    it('matrix maxpool, custom stride', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4'}, {cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '11' }, { cellValue: '12' }, { cellValue: '13' }, { cellValue: '14'}, {cellValue: '15' }, { cellValue: '16' }],
        [{ cellValue: '21' }, { cellValue: '22' }, { cellValue: '23' }, { cellValue: '24'}, {cellValue: '25' }, { cellValue: '26' }],
        [{ cellValue: '28' }, { cellValue: '29' }, { cellValue: '30' }, { cellValue: '31'}, {cellValue: '32' }, { cellValue: '33' }],
        [{ cellValue: '=maxpool(A1:F4,3,1)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(23)
      expect(engine.getCellValue(adr('A6')).cellValue).toBeCloseTo(30)
      expect(engine.getCellValue(adr('B5')).cellValue).toBeCloseTo(24)
      expect(engine.getCellValue(adr('B6')).cellValue).toBeCloseTo(31)
      expect(engine.getCellValue(adr('C5')).cellValue).toBeCloseTo(25)
      expect(engine.getCellValue(adr('C6')).cellValue).toBeCloseTo(32)
      expect(engine.getCellValue(adr('D5')).cellValue).toBeCloseTo(26)
      expect(engine.getCellValue(adr('D6')).cellValue).toBeCloseTo(33)
    })

    it('maxpool wrong number of arguments', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '=MAXPOOL(0)' }, { cellValue: '=MAXPOOL(0, 0,0,0)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
      expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('matrix medianpool on even square', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '1' }, { cellValue: '2'}, {cellValue: '1' }, { cellValue: '5' }],
        [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '3' }, { cellValue: '7'}, {cellValue: '6' }, { cellValue: '7' }],
        [{ cellValue: '=medianpool(A1:F2,2)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A3')).cellValue).toBeCloseTo(2.5)
      expect(engine.getCellValue(adr('B3')).cellValue).toBeCloseTo(2.5)
      expect(engine.getCellValue(adr('C3')).cellValue).toBeCloseTo(5.5)
    })

    it('medianpool wrong number of arguments', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '=MEDIANPOOL(0)' }, { cellValue: '=MEDIANPOOL(0,0,0,0)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
      expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('matrix medianpool on odd square', () => {
      const [engine] = HyperFormula.buildFromArray({ cells: [
        [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '1' }], // right shot from the beginning
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: '3' }, { cellValue: '3' }, { cellValue: '3' }],

        [{ cellValue: '2' }, { cellValue: '2' }, { cellValue: '2' }], // need one step to the left
        [{ cellValue: '3' }, { cellValue: '4' }, { cellValue: '6' }],
        [{ cellValue: '10' }, { cellValue: '10' }, { cellValue: '10' }],

        [{ cellValue: '0' }, { cellValue: '0' }, { cellValue: '0' }], // need one step to the right
        [{ cellValue: '4' }, { cellValue: '6' }, { cellValue: '7' }],
        [{ cellValue: '8' }, { cellValue: '8' }, { cellValue: '8' }],

        [{ cellValue: '=medianpool(A1:C9,3)' }],
      ]}, config)

      expect(engine.getCellValue(adr('A10')).cellValue).toBeCloseTo(2)
      expect(engine.getCellValue(adr('A11')).cellValue).toBeCloseTo(4)
      expect(engine.getCellValue(adr('A12')).cellValue).toBeCloseTo(6)
    })
  }

  describe('GPU.js', () => sharedExamples({gpujs: GPU.GPU ?? GPU, gpuMode: 'cpu'}))

  describe('CPU fallback', () => sharedExamples({}))
})

describe('Function TRANSPOSE', () => {
  it('transpose works', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(1)
    expect(engine.getCellValue(adr('B4')).cellValue).toBeCloseTo(3)
    expect(engine.getCellValue(adr('C4')).cellValue).toBeCloseTo(5)
    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(2)
    expect(engine.getCellValue(adr('B5')).cellValue).toBeCloseTo(4)
    expect(engine.getCellValue(adr('C5')).cellValue).toBeCloseTo(6)
  })

  it('transpose works for scalar', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(1)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBeCloseTo(1)
  })

  it('transpose returns error if argument evaluates to error', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE(4/0)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('transpose wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=TRANSPOSE()' }, { cellValue: '=TRANSPOSE(C1:C2, D1:D2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('B1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('transpose without braces', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '3' }, { cellValue: '4' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('A5')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('B4')).cellValue).toBe(3)
  })

  it('transpose any values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: 'foo' }, { cellValue: 'bar' }],
      [{ cellValue: '=1/0' }, { cellValue: '=TRUE()' }],
      [{ cellValue: '=TRANSPOSE(A1:B3)' }],
    ]})

    expect(engine.getCellValue(adr('A4')).cellValue).toBeCloseTo(1)
    expect(engine.getCellValue(adr('B4')).cellValue).toEqual('foo')
    expect(engine.getCellValue(adr('C4')).cellValue).toEqual(detailedErrorWithOrigin(ErrorType.DIV_BY_ZERO, 'Sheet1!A3'))
    expect(engine.getCellValue(adr('A5')).cellValue).toBeCloseTo(2)
    expect(engine.getCellValue(adr('B5')).cellValue).toEqual('bar')
    expect(engine.getCellValue(adr('C5')).cellValue).toEqual(true)
  })
})
