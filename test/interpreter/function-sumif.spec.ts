import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {plPL} from '../../src/i18n/languages'
import {StatType} from '../../src/statistics'
import {adr, detailedError, expectArrayWithSameContent} from '../testUtils'

describe('Function SUMIF - argument validations and combinations', () => {
  it('requires 2 or 3 arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(C1)' }],
      [{ cellValue: '=SUMIF(C1, ">0", C1, C1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('works when 2nd arg is an integer', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(C1:C2, 1, B1:B2)' }, { cellValue: 2 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: true }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(2)
  })

  it('works when 2nd arg is a boolean', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(C1:C2, TRUE(), B1:B2)' }, { cellValue: 2 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: true }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(3)
  })

  it('works when 2nd arg is a string "true"', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(C1:C2, "=TRUE", B1:B2)' }, { cellValue: 2 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: true }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(3)
  })

  it('works when 2nd arg is a string "true" in different language', () => {
    HyperFormula.registerLanguage('plPL', plPL)
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(C1:C2, "=PRAWDA", B1:B2)' }, { cellValue: 2 }, { cellValue: 1 }],
      [{ cellValue: null }, { cellValue: 3 }, { cellValue: true }],
    ], {language: 'plPL'})

    expect(engine.getCellValue(adr('A1'))).toEqual(3)
  })

  it('error when criterion unparsable', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(B1:B2, "><foo", C1:C2)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.BadCriterion))
  })

  it('error when different width dimension of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(B1:C1, ">0", B2:D2)' }],
      [{ cellValue: '=SUMIF(B1, ">0", B2:D2)' }],
      [{ cellValue: '=SUMIF(B1:D1, ">0", B2)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
  })

  it('error when different height dimension of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(B1:B2, ">0", C1:C3)' }],
      [{ cellValue: '=SUMIF(B1, ">0", C1:C2)' }],
      [{ cellValue: '=SUMIF(B1:B2, ">0", C1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
  })

  it('error when number of elements match but dimensions doesnt', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(B1:B2, ">0", B1:C1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
  })

  it('scalars are treated like singular arrays', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(10, ">1", 42)' }],
      [{ cellValue: '=SUMIF(0, ">1", 42)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(42)
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
  })

  it('error propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIF(4/0, ">1", 42)' }],
      [{ cellValue: '=SUMIF(0, 4/0, 42)' }],
      [{ cellValue: '=SUMIF(0, ">1", 4/0)' }],
      [{ cellValue: '=SUMIF(0, 4/0, FOOBAR())' }],
      [{ cellValue: '=SUMIF(4/0, FOOBAR(), 42)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works when arguments are just references', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUMIF(A1, ">1", B1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(3)
  })

  it('works with range values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '3' }, { cellValue: '5'}],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '7' }, { cellValue: '9'}],
      [{ cellValue: '=SUMIF(MMULT(A1:B2, A1:B2), "=2", MMULT(C1:D2, C1:D2))' }],
      [{ cellValue: '=SUMIF(A1:B2, "=1", MMULT(C1:D2, C1:D2))' }],
      [{ cellValue: '=SUMIF(MMULT(A1:B2, A1:B2), "=2", C1:D2)' }],
    ])

    expect(engine.getCellValue(adr('A3'))).toEqual(304)
    expect(engine.getCellValue(adr('A4'))).toEqual(304)
    expect(engine.getCellValue(adr('A5'))).toEqual(24)
  })

  it('works for mixed reference/range arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUMIF(A1:A1, ">1", B1)' }],
      [{ cellValue: '=SUMIF(A1, ">1", B1:B1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(3)
    expect(engine.getCellValue(adr('A3'))).toEqual(3)
  })

  it('works for 2 arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '10' }, { cellValue: '20' }, { cellValue: '30' }],
      [{ cellValue: '=SUMIF(A1:C1, ">15")' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(50)
  })

  it('works for matrices', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }],
      [{ cellValue: '=TRANSPOSE(A1:B1)' }],
      [],
      [{ cellValue: '=SUMIF(A2:A3, ">0", A2:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(3)
  })
})

describe('Function SUMIF(S) - calculations and optimizations', () => {
  it('no coercion when sum', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '="3"' }],
      [{ cellValue: '=SUMIF(A1, ">1", B1)' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(0)
  })

  it('empty coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 1 }, { cellValue: null }],
      [{ cellValue: 2 }, { cellValue: 8 }],
      [{ cellValue: 3 }, { cellValue: 9 }],
      [{ cellValue: '=SUMIF(B1:B3,"=",A1:A3)' }],
      [{ cellValue: '=SUMIF(B1:B3,">=",A1:A3)' }],
      [{ cellValue: '=SUMIF(B1:B3,"<=",A1:A3)' }],
      [{ cellValue: '=SUMIF(B1:B3,"<>",A1:A3)' }],
    ])
    expect(engine.getCellValue(adr('A4'))).toEqual(1)
    expect(engine.getCellValue(adr('A5'))).toEqual(0)
    expect(engine.getCellValue(adr('A6'))).toEqual(0)
    expect(engine.getCellValue(adr('A7'))).toEqual(5)
  })

  it('works for subranges with different conditions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A1,"="&A1,B1:B1)' }],
      [{ cellValue: '2' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A2,"="&A2,B1:B2)' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A3,"="&A3,B1:B3)' }],
      [{ cellValue: '3' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A4,"="&A4,B1:B4)' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A5,"="&A5,B1:B5)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqual(1)
    expect(engine.getCellValue(adr('C2'))).toEqual(1)
    expect(engine.getCellValue(adr('C3'))).toEqual(2)
    expect(engine.getCellValue(adr('C4'))).toEqual(1)
    expect(engine.getCellValue(adr('C5'))).toEqual(3)
  })

  it('works for subranges with inequality', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A1,">2",B1:B1)' }],
      [{ cellValue: '2' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A2,">2",B1:B2)' }],
      [{ cellValue: '3' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A3,">2",B1:B3)' }],
      [{ cellValue: '4' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A4,">2",B1:B4)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqual(0)
    expect(engine.getCellValue(adr('C2'))).toEqual(0)
    expect(engine.getCellValue(adr('C3'))).toEqual(1)
    expect(engine.getCellValue(adr('C4'))).toEqual(2)
  })

  it('works for subranges with more interesting criterions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A1,"=1",B1:B1)' }],
      [{ cellValue: '2' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A2,"<=2",B1:B2)' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A3,"<2",B1:B3)' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A4,">4",B1:B4)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqual(1)
    expect(engine.getCellValue(adr('C2'))).toEqual(2)
    expect(engine.getCellValue(adr('C3'))).toEqual(2)
    expect(engine.getCellValue(adr('C4'))).toEqual(0)
  })

  it('discontinuous sumif range', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A1,"="&A1,B1:B1)' }],
      [{ cellValue: '2' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A2,"="&A2,B1:B2)' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A3,"="&A3,B1:B3)' }],
      [{ cellValue: '0' }, { cellValue: '0' }, { cellValue: '0' }],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '=SUMIF(A1:A5,"="&A5,B1:B5)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqual(1)
    expect(engine.getCellValue(adr('C2'))).toEqual(1)
    expect(engine.getCellValue(adr('C3'))).toEqual(2)
    expect(engine.getCellValue(adr('C5'))).toEqual(3)
  })

  it('using full cache', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }],
      [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(5)
    expect(engine.getCellValue(adr('A5'))).toEqual(5)
    expect(engine.getStats().get(StatType.CRITERION_FUNCTION_FULL_CACHE_USED)).toEqual(1)
  })

  it('works with different sheets', () => {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [
        [{ cellValue: '0' }, { cellValue: '3' }],
        [{ cellValue: '1' }, { cellValue: '5' }],
        [{ cellValue: '2' }, { cellValue: '7' }],
        [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }],
        [{ cellValue: '=SUMIF(Sheet2!A1:A3, "=1", B1:B3)' }],
      ],
      Sheet2: [
        [{ cellValue: '0' }, { cellValue: '30' }],
        [{ cellValue: '0' }, { cellValue: '50' }],
        [{ cellValue: '1' }, { cellValue: '70' }],
        [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }],
      ],
    })

    expect(engine.getCellValue(adr('A4', 0))).toEqual(5)
    expect(engine.getCellValue(adr('A5', 0))).toEqual(7)
    expect(engine.getCellValue(adr('A4', 1))).toEqual(70)
    expect(engine.getStats().get(StatType.CRITERION_FUNCTION_FULL_CACHE_USED)).toEqual(0)
  })

  it('works when precision sensitive (default setting)', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1.0000000001' }, { cellValue: '1' }],
      [{ cellValue: '1.00000000000005' }, { cellValue: '2' }],
      [{ cellValue: '1.00000000000005' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }]
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(6)
  })

  it('criterions are not accent sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "=ąbcd", B1:B3)' }]
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(3)
  })

  it('criterions are accent sensitive if specified', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "=ąbcd", B1:B3)' }]
    ], {accentSensitive: true})

    expect(engine.getCellValue(adr('A4'))).toEqual(0)
  })

  it('criterions are not case sensitive', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "<>abcd", B1:B3)' }]
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(4)
  })

  it('criterions are not case sensitive 2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "=abcd", B1:B3)' }]
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(3)
  })

  it('criterions are case sensitive if specified', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: '=SUMIF(A1:A3, "<>abcd", B1:B3)' }]
    ], {caseSensitive: true})

    expect(engine.getCellValue(adr('A4'))).toEqual(6)
  })

  it('usage of wildcards', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'ABCD' }, { cellValue: '2' }],
      [{ cellValue: 'abc' }, { cellValue: '4' }],
      [{ cellValue: 0 }, { cellValue: 8 }],
      [{ cellValue: '=SUMIF(A1:A4, "=a?c*", B1:B4)' }]
    ])

    expect(engine.getCellValue(adr('A5'))).toEqual(7)
  })

  it('wildcards instead of regexps', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'a+?*' }, { cellValue: '1' }],
      [{ cellValue: 'a?*' }, { cellValue: '2' }],
      [{ cellValue: 'aa~?~*' }, { cellValue: '4' }],
      [{ cellValue: 0 }, { cellValue: 8 }],
      [{ cellValue: '=SUMIF(A1:A4, "=a+~?~*", B1:B4)' }]
    ])

    expect(engine.getCellValue(adr('A5'))).toEqual(1)
  })

  it('regexps', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'abd' }, { cellValue: '2' }],
      [{ cellValue: '.*c.*' }, { cellValue: '4' }],
      [{ cellValue: 0 }, { cellValue: 8 }],
      [{ cellValue: '=SUMIF(A1:A4, "<>.*c.*", B1:B4)' }]
    ], {useRegularExpressions: true})

    expect(engine.getCellValue(adr('A5'))).toEqual(10)
  })

  it('incorrect regexps', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: 'abcd' }, { cellValue: '1' }],
      [{ cellValue: 'abd' }, { cellValue: '2' }],
      [{ cellValue: '.*c.*' }, { cellValue: '4' }],
      [{ cellValue: 0 }, { cellValue: 8 }],
      [{ cellValue: '=SUMIF(A1:A4, "=)", B1:B4)' }]
    ], {useRegularExpressions: true})

    expect(engine.getCellValue(adr('A5'))).toEqual(0)
  })

  it('ignore errors', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '3' }],
      [{ cellValue: '=4/0' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '=4/0' }],
      [{ cellValue: '1' }, { cellValue: '10' }],
      [{ cellValue: '=SUMIF(A1:A4, "=1", B1:B4)' }],
    ])

    expect(engine.getCellValue(adr('A5'))).toEqual(13)
  })
})

describe('Function SUMIFS - argument validations and combinations', () => {
  it('requires odd number of arguments, but at least 3', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(C1, ">0")' }],
      [{ cellValue: '=SUMIFS(C1, ">0", B1, B1)' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('error when criterion unparsable', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(B1:B2, C1:C2, "><foo")' }],
      [{ cellValue: '=SUMIFS(B1:B2, C1:C2, "=1", C1:C2, "><foo")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.BadCriterion))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.BadCriterion))
  })

  it('error when different width dimension of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(B1:C1, B2:D2, ">0")' }],
      [{ cellValue: '=SUMIFS(B1, B2:D2, ">0")' }],
      [{ cellValue: '=SUMIFS(B1:D1, B2, ">0")' }],
      [{ cellValue: '=SUMIFS(B1:D1, B2:D2, ">0", B2:E2, ">0")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
  })

  it('error when different height dimension of arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(B1:B2, C1:C3, ">0")' }],
      [{ cellValue: '=SUMIFS(B1, C1:C2, ">0")' }],
      [{ cellValue: '=SUMIFS(B1:B2, C1, ">0")' }],
      [{ cellValue: '=SUMIFS(B1:B2, C1:C2, ">0", C1:C3, ">0")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.EqualLength))
  })

  it('scalars are treated like singular arrays', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(42, 10, ">1")' }],
      [{ cellValue: '=SUMIFS(42, 0, ">1")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqual(42)
    expect(engine.getCellValue(adr('A2'))).toEqual(0)
  })

  it('error propagation', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=SUMIFS(4/0, 42, ">1")' }],
      [{ cellValue: '=SUMIFS(0, 4/0, ">1")' }],
      [{ cellValue: '=SUMIFS(0, 42, 4/0)' }],
      [{ cellValue: '=SUMIFS(0, 4/0, FOOBAR())' }],
      [{ cellValue: '=SUMIFS(4/0, FOOBAR(), ">1")' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A2'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A3'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A4'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('A5'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('works when arguments are just references', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUMIFS(B1, A1, ">1")' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(3)
  })

  it('works with range values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '3' }, { cellValue: '5'}],
      [{ cellValue: '1' }, { cellValue: '1' }, { cellValue: '7' }, { cellValue: '9'}],
      [{ cellValue: '=SUMIFS(MMULT(C1:D2, C1:D2), MMULT(A1:B2, A1:B2), "=2")' }],
      [{ cellValue: '=SUMIFS(MMULT(C1:D2, C1:D2), A1:B2, "=1")' }],
      [{ cellValue: '=SUMIFS(C1:D2, MMULT(A1:B2, A1:B2), "=2")' }],
    ])

    expect(engine.getCellValue(adr('A3'))).toEqual(304)
    expect(engine.getCellValue(adr('A4'))).toEqual(304)
    expect(engine.getCellValue(adr('A5'))).toEqual(24)
  })

  it('works for mixed reference/range arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '2' }, { cellValue: '3' }],
      [{ cellValue: '=SUMIFS(B1, A1:A1, ">1")' }],
      [{ cellValue: '4' }, { cellValue: '5' }],
      [{ cellValue: '=SUMIFS(B3:B3, A3, ">1")' }],
    ])

    expect(engine.getCellValue(adr('A2'))).toEqual(3)
    expect(engine.getCellValue(adr('A4'))).toEqual(5)
  })

  it('coerces dates as numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '9160250011660588' }, { cellValue: '43469' }, { cellValue: '25000'}],
      [{ cellValue: '2' }, { cellValue: '9160250011689568' }, { cellValue: '43631' }, { cellValue: '15000'}],
      [{ cellValue: '=SUMIF(C2:C11,">31/05/2019",D2:D11)' }]
    ], {dateFormats: [{ cellValue: 'DD/MM/YYYY' }]})
    expect(engine.getCellValue(adr('A3'))).toEqual(15000)
  })
})

describe('Function SUMIFS - calcultions on more than one criteria', () => {
  it('works for more than one criterion/range pair', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '100' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '101' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '102' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIFS(C1:C3, A1:A3, ">=1", B1:B3, "<102")' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(5)
  })
})

describe('Function SUMIF - cache recalculation after cruds', () => {
  it('recalculates SUMIF if changes in summed range', () => {
    const sheet = [
      [{ cellValue: '10' }, { cellValue: '10' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '=SUMIF(A2:B2, ">=1", A1:B1)' }, { cellValue: '0' }],
    ]
    const [engine] = HyperFormula.buildFromArray(sheet)

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '1' }, { cellValue: '3' }]])

    expect(engine.getCellValue(adr('A3'))).toEqual(4)
    expect(changes.length).toEqual(3)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [{ cellValue: 1 }, { cellValue: 3 }, { cellValue: 4 }])
  })

  it('recalculates SUMIF if changes in tested range', () => {
    const sheet = [
      [{ cellValue: '10' }, { cellValue: '10' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '0' }, { cellValue: '=SUMIF(A1:B1, ">=2", A2:B2)' }],
    ]
    const [engine] = HyperFormula.buildFromArray(sheet)

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '1' }, { cellValue: '3' }]])

    expect(engine.getCellValue(adr('B3'))).toEqual(6)
    expect(changes.length).toEqual(3)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [{ cellValue: 1 }, { cellValue: 3 }, { cellValue: 6 }])
  })

  it('recalculates SUMIF if summed range same as tested range', () => {
    const sheet = [
      [{ cellValue: '10' }, { cellValue: '10' }],
      [{ cellValue: '0' }, { cellValue: '=SUMIF(A1:B1, ">=2", A1:B1)' }],
    ]
    const [engine] = HyperFormula.buildFromArray(sheet)

    expect(engine.getCellValue(adr('B2'))).toEqual(20)

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '1' }, { cellValue: '3' }]])

    expect(engine.getCellValue(adr('B2'))).toEqual(3)
    expect(changes.length).toEqual(3)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [{ cellValue: 1 }, { cellValue: 3 }, { cellValue: 3 }])
  })
})

describe('Function SUMIFS - cache recalculation after cruds', () => {
  it('recalculates SUMIFS if changes in summed range', () => {
    const sheet = [
      [{ cellValue: '10' }, { cellValue: '10' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '7' }, { cellValue: '8' }],
      [{ cellValue: '=SUMIFS(A1:B1, A2:B2, ">=5", A3:B3, ">=7")' }],
    ]
    const [engine] = HyperFormula.buildFromArray(sheet)

    const [changes] = engine.setCellContents(adr('A1'), [[{ cellValue: '1' }, { cellValue: '3' }]])

    expect(engine.getCellValue(adr('A4'))).toEqual(4)
    expect(changes.length).toEqual(3)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [{ cellValue: 1 }, { cellValue: 3 }, { cellValue: 4 }])
  })

  it('recalculates SUMIFS if changes in one of the tested range', () => {
    const sheet = [
      [{ cellValue: '10' }, { cellValue: '10' }],
      [{ cellValue: '5' }, { cellValue: '6' }],
      [{ cellValue: '7' }, { cellValue: '8' }],
      [{ cellValue: '=SUMIFS(A1:B1, A2:B2, ">=5", A3:B3, ">=7")' }],
    ]
    const [engine] = HyperFormula.buildFromArray(sheet)
    expect(engine.getCellValue(adr('A4'))).toEqual(20)

    const [changes] = engine.setCellContents(adr('A3'), [[{ cellValue: '1' }, { cellValue: '7' }]])

    expect(engine.getCellValue(adr('A4'))).toEqual(10)
    expect(changes.length).toEqual(3)
    expectArrayWithSameContent(changes.map((change) => change.newValue), [{ cellValue: 1 }, { cellValue: 7 }, { cellValue: 10 }])
  })
})
