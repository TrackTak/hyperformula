import {ErrorType, HyperFormula} from '../../src'
import {ConfigParams} from '../../src/Config'
import {ErrorMessage} from '../../src/error-message'
import {Sheet} from '../../src/Sheet'
import {adr, detailedError} from '../testUtils'

const sharedExamples = (builder: (sheet: Sheet, config?: Partial<ConfigParams>) => HyperFormula) => {
  describe('VLOOKUP - args validation', () => {
    it('not enough parameters', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, A2:B3)' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('too many parameters', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, A2:B3, 2, TRUE(), "foo")' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    })

    it('wrong type of first argument', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(D1:E1, A2:B3, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('wrong type of second argument', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, "foo", 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('wrong type of third argument', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, A2:B3, "foo", TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    })

    it('wrong type of fourth argument', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, A2:B3, 2, "bar")' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.WrongType))
    })

    it('should return error when index argument greater that range width', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, A2:B3, 3)' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.REF, ErrorMessage.IndexLarge))
    })

    it('should return error when index is less than one', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(1, C2:D3, 0)' }],
        [{ cellValue: '=VLOOKUP(1, C2:D3, -1)' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
      expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.LessThanOne))
    })

    it('should propagate errors properly', () => {
      const [engine] = HyperFormula.buildFromArray([
        [{ cellValue: '=VLOOKUP(1/0, B1:B1, 1)' }],
        [{ cellValue: '=VLOOKUP(1, B1:B1, 1/0)' }],
        [{ cellValue: '=VLOOKUP(1, A10:A11, 1, NA())' }]
      ])

      expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
      expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
      expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.NA))
    })
  })

  describe('VLOOKUP', () => {
    it('should find value in sorted range', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '4' }, { cellValue: 'd' }],
        [{ cellValue: '5' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(2, A1:B5, 2)' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('b')
    })

    it('should find value in sorted range using linearSearch', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '4' }, { cellValue: 'd' }],
        [{ cellValue: '5' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(2, A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('b')
    })

    it('works with wildcards', () => {
      const engine = builder([
        [{ cellValue: 'abd' }, { cellValue: 'a' }],
        [{ cellValue: 1 }, { cellValue: 'b' }],
        [{ cellValue: 'aaaa' }, { cellValue: 'c' }],
        [{ cellValue: 'ddaa' }, { cellValue: 'd' }],
        [{ cellValue: 'abcd' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP("*c*", A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('e')
    })

    it('on sorted data ignores wildcards', () => {
      const engine = builder([
        [{ cellValue: 'abd' }, { cellValue: 'a' }],
        [{ cellValue: 1 }, { cellValue: 'b' }],
        [{ cellValue: '*c*' }, { cellValue: 'c' }],
        [{ cellValue: 'ddaa' }, { cellValue: 'd' }],
        [{ cellValue: 'abcd' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP("*c*", A1:B5, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('c')
    })

    it('should find value in unsorted range using linearSearch', () => {
      const engine = builder([
        [{ cellValue: '5' }, { cellValue: 'a' }],
        [{ cellValue: '4' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '2' }, { cellValue: 'd' }],
        [{ cellValue: '1' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(2, A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('d')
    })

    it('should find value in unsorted range using linearSearch', () => {
      const engine = builder([
        [{ cellValue: '5' }, { cellValue: 'a' }],
        [{ cellValue: '4' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '2' }, { cellValue: 'd' }],
        [{ cellValue: '1' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(2, A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('d')
    })

    it('should find value in sorted range with different types', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '=TRUE()' }, { cellValue: 'd' }],
        [{ cellValue: 'foo' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(TRUE(), A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('d')
    })

    it('should find value in unsorted range with different types', () => {
      const engine = builder([
        [{ cellValue: '=TRUE()' }, { cellValue: 'a' }],
        [{ cellValue: '4' }, { cellValue: 'b' }],
        [{ cellValue: 'foo' }, { cellValue: 'c' }],
        [{ cellValue: '2' }, { cellValue: 'd' }],
        [{ cellValue: 'bar' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(2, A1:B5, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('d')
    })

    it('should return lower bound for sorted values', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '=VLOOKUP(4, A1:B3, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A4'))).toEqual('c')
    })

    it('should return error when all values are greater', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '=VLOOKUP(0, A1:B3, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should return error when value not present using linear search', () => {
      const engine = builder([
        [{ cellValue: '1' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '=VLOOKUP(4, A1:B3, 2, FALSE())' }],
      ])

      expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
    })

    it('should find value if index build during evaluation', () => {
      const engine = builder([
        [{ cellValue: '=A2' }, { cellValue: 'a' }],
        [{ cellValue: '1' }, { cellValue: 'b' }],
        [{ cellValue: '2' }, { cellValue: 'c' }],
        [{ cellValue: '=VLOOKUP(1, A1:B3, 2, TRUE())' }],
      ])

      expect(engine.getCellValue(adr('A4'))).toEqual('a')
    })

    it('should properly calculate absolute row index', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(3, A3:A5, 1, TRUE())' }],
        [{ cellValue: 'foo' }],
        [{ cellValue: '1' }],
        [{ cellValue: '2' }],
        [{ cellValue: '3' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqual(3)
    })

    it('should work for standard matrices', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(3, A4:B6, 2, TRUE())' }],
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '=TRANSPOSE(A2:C3)' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqual(6)
    })

    it('should work after updating standard matrix', () => {
      const engine = builder([
        [{ cellValue: '=VLOOKUP(4, A4:B6, 2, TRUE())' }],
        [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '3' }],
        [{ cellValue: '4' }, { cellValue: '5' }, { cellValue: '6' }],
        [{ cellValue: '=TRANSPOSE(A2:C3)' }],
      ])

      expect(engine.getCellValue(adr('A1'))).toEqual(6)

      engine.setCellContents(adr('C2'), '5')

      expect(engine.getCellValue(adr('A1'))).toEqual(5)
    })

    it('should coerce empty arg to 0', () => {
      const engine = builder([
        [{ cellValue: '0' }, { cellValue: 'a' }],
        [{ cellValue: '2' }, { cellValue: 'b' }],
        [{ cellValue: '3' }, { cellValue: 'c' }],
        [{ cellValue: '4' }, { cellValue: 'd' }],
        [{ cellValue: '5' }, { cellValue: 'e' }],
        [{ cellValue: '=VLOOKUP(C3, A1:B5, 2)' }],
        [{ cellValue: '=VLOOKUP(, A1:B5, 2)' }],
      ])

      expect(engine.getCellValue(adr('A6'))).toEqual('a')
      expect(engine.getCellValue(adr('A7'))).toEqual('a')
    })
  })
}

describe('ColumnIndex strategy', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedExamples((sheet: Sheet, config: any = {}) => {
    return HyperFormula.buildFromArray(sheet, {
      useColumnIndex: true,
      ...config,
    })[0]
  })
})

describe('BinarySearchStrategy', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedExamples((sheet: Sheet, config: any = {}) => {
    return HyperFormula.buildFromArray(sheet, {
      useColumnIndex: false,
      ...config,
    })[0]
  })

  it('should calculate indexes properly when using binary search', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP(4, A5:A10, 1, TRUE())' }],
      [],
      [],
      [],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
    ], {useColumnIndex: false})

    expect(engine.getCellValue(adr('A1'))).toEqual(4)
  })

  it('should calculate indexes properly when using naive approach', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP(4, A5:A10, 1, FALSE())' }],
      [],
      [],
      [],
      [{ cellValue: '1' }],
      [{ cellValue: '2' }],
      [{ cellValue: '3' }],
      [{ cellValue: '4' }],
      [{ cellValue: '5' }],
    ], {useColumnIndex: false})

    expect(engine.getCellValue(adr('A1'))).toEqual(4)
  })

  it('should coerce null to zero when using naive approach', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP(, A2:A4, 1, FALSE())' }],
      [{ cellValue: 1 }],
      [{ cellValue: 3 }],
      [{ cellValue: 0 }],
    ], {useColumnIndex: false})

    expect(engine.getCellValue(adr('A1'))).toEqual(0)
  })

  it('should work on column ranges', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP(2,B:C,2)' }, { cellValue: 1 }, { cellValue: 'a' }],
      [{ cellValue: null }, { cellValue: 2 }, { cellValue: 'b' }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: 'c' }],
    ])
    expect(engine.getCellValue(adr('A1'))).toEqual('b')
  })

  it('works for strings, is not case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: '1' }],
      [{ cellValue: 'b' }, { cellValue: '2' }],
      [{ cellValue: 'c' }, { cellValue: '3' }],
      [{ cellValue: 'A' }, { cellValue: '4' }],
      [{ cellValue: 'B' }, { cellValue: '5' }],
      [{ cellValue: '=VLOOKUP("A", A1:B5, 2, FALSE())' }]
    ], {caseSensitive: false})

    expect(engine.getCellValue(adr('A6'))).toEqual(1)
  })

  it('works for strings, is not case sensitive even if config defines case sensitivity', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: '1' }],
      [{ cellValue: 'b' }, { cellValue: '2' }],
      [{ cellValue: 'c' }, { cellValue: '3' }],
      [{ cellValue: 'A' }, { cellValue: '4' }],
      [{ cellValue: 'B' }, { cellValue: '5' }],
      [{ cellValue: '=VLOOKUP("A", A1:B5, 2, FALSE())' }]
    ], {caseSensitive: true})

    expect(engine.getCellValue(adr('A6'))).toEqual(1)
  })

  it('should find value in sorted range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a' }, { cellValue: '1' }],
      [{ cellValue: 'B' }, { cellValue: '2' }],
      [{ cellValue: 'c' }, { cellValue: '3' }],
      [{ cellValue: 'd' }, { cellValue: '4' }],
      [{ cellValue: 'e' }, { cellValue: '5' }],
      [{ cellValue: '=VLOOKUP("b", A1:B5, 2)' }],
    ], {caseSensitive: false})
    expect(engine.getCellValue(adr('A6'))).toEqual(2)
  })

  it('should properly report no match', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP("0", A2:A5, 1)' }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      ['\'1'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.ValueNotFound))
  })

  it('should properly report approximate matching', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=VLOOKUP("2", A2:A5, 1)' }],
      [{ cellValue: 1 }],
      [{ cellValue: 2 }],
      [{ cellValue: 3 }],
      ['\'1'],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual('1')
  })
})
