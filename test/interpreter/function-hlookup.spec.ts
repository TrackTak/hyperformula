import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function HLOOKUP', () => {
  describe('HLOOKUP - args validation', () => {
    it('not enough parameters', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, A2:B3)' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('too many parameters', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, A2:B3, 2, TRUE(), "foo")' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('wrong type of first argument', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(D1:E1, A2:B3, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('wrong type of second argument', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, "foo", 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('wrong type of third argument', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, A2:B3, "foo", TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    })

    it('wrong type of fourth argument', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, A2:B3, 2, "bar")' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('should return error when index argument greater that range height', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, A2:B3, 3)' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.REF, ErrorMessage.IndexLarge))
    })

    it('should return error when index is less than one', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1, C3:D5, 0)' }],
        [{ cellValue: '=HLOOKUP(1, C2:D3, -1)' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
      expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    })

    it('should propagate errors properly', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(1/0, B1:B1, 1)' }],
        [{ cellValue: '=HLOOKUP(1, B1:B1, 1/0)' }],
        [{ cellValue: '=HLOOKUP(1, A10:A11, 1, NA())' }]
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
      expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
      expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA))
    })
  })

  describe('HLOOKUP', () => {
    it('should find value in sorted range', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4'}, {cellValue: '5' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(2, A1:E2, 2)' }]
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('b')
    })

    it('should find value in sorted range using linearSearch', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4'}, {cellValue: '5' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(2, A1:E2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('b')
    })

    it('works with wildcards', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: 'abd' }, { cellValue: 1 }, { cellValue: 'aaaa' }, { cellValue: 'ddaa'}, {cellValue: 'abcd' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP("*c*", A1:E2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('e')
    })

    it('on sorted data ignores wildcards', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: 'abd' }, { cellValue: 1 }, { cellValue: '*c*' }, { cellValue: 'ddaa'}, {cellValue: 'abcd' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP("*c*", A1:E2, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('c')
    })

    it('should find value in unsorted range using linearSearch', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '5' }, { cellValue: '4' }, { cellValue: '3' }, { cellValue: '2'}, {cellValue: '1' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(2, A1:E2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('d')
    })

    it('should find value in sorted range with different types', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '=TRUE()'}, {cellValue: 'foo' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(TRUE(), A1:E2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('d')
    })

    it('should find value in unsorted range with different types', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=TRUE()' }, { cellValue: '4' }, { cellValue: 'foo' }, { cellValue: '2'}, {cellValue: 'bar' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(2, A1:E2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('d')
    })

    it('should return lower bound for sorted values', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }],
        [{ cellValue: '=HLOOKUP(4, A1:C2, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('c')
    })

    it('should return error when all values are greater', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }],
        [{ cellValue: '=HLOOKUP(0, A1:C2, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should return error when value not present using linear search', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }],
        [{ cellValue: '=HLOOKUP(4, A1:C2, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should find value if index build during evaluation', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=B1' }, { cellValue: '1' }, { cellValue: '2' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }],
        [{ cellValue: '=HLOOKUP(1, A1:C2, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('a')
    })

    it('should properly calculate absolute row index', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(3, C1:E1, 1, TRUE())' }, { cellValue: 'foo' }, { cellValue: '1' }, { cellValue: '2'}, {cellValue: '3' }]
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
    })

    it('should calculate indexes properly when using binary search', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(4, E1:J1, 1, TRUE())' }, { cellValue: null }, { cellValue: null }, { cellValue: null}, {cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4' }, { cellValue: '5' }]
      ], {useColumnIndex: false})

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
    })

    it('should calculate indexes properly when using naitve approach', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(4, E1:J1, 1, TRUE())' }, { cellValue: null }, { cellValue: null }, { cellValue: null}, {cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4' }, { cellValue: '5' }]
      ], {useColumnIndex: false})

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
    })

    it('should coerce empty arg to 0', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '0' }, { cellValue: '2' }, { cellValue: '3' }, { cellValue: '4'}, {cellValue: '5' }],
        [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
        [{ cellValue: '=HLOOKUP(F3, A1:E2, 2)' }],
        [{ cellValue: '=HLOOKUP(, A1:E2, 2)' }],
      ])

      expect(engine.getCellValue(adr('A3')).cellValue).toEqual('a')
      expect(engine.getCellValue(adr('A4')).cellValue).toEqual('a')
    })

    it('should not coerce', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP("1", A2:C2, 1)' }],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should properly report no match', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP("0", A2:D2, 1)' }],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '\'1' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should properly report approximate matching', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP("2", A2:D2, 1)' }],
        [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: '\'1' }],
      ])

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual('1')
    })

    it('should coerce null to zero when using naive approach', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=HLOOKUP(, A2:C2, 1, FALSE())' }],
        [{ cellValue: 1 }, { cellValue: 3 }, { cellValue: 0 }],
      ], {useColumnIndex: false})

      expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    })
  })

  it('should work on row ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=HLOOKUP(2,2:3,2)' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }],
      [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }],
    ])
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual('b')
  })

  it('works for strings, is not case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'A'}, {cellValue: 'B' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
      [{ cellValue: '=HLOOKUP("A", A1:E2, 2, FALSE())' }]
    ], {caseSensitive: false})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('works for strings, is not case sensitive even if config defines case sensitivity', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'b' }, { cellValue: 'c' }, { cellValue: 'A'}, {cellValue: 'B' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
      [{ cellValue: '=HLOOKUP("A", A1:E2, 2, FALSE())' }]
    ], {caseSensitive: true})

    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
  })

  it('should find value in sorted range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: 'B' }, { cellValue: 'c' }, { cellValue: 'd'}, {cellValue: 'e' }],
      [{ cellValue: 1 }, { cellValue: 2 }, { cellValue: 3 }, { cellValue: 4}, {cellValue: 5 }],
      [{ cellValue: '=HLOOKUP("b", A1:E2, 2)' }],
    ], {caseSensitive: false})
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })
})
