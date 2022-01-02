import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Interpreter - Boolean operators', () => {
  it('Equals operator - numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1=2' }, { cellValue: '=1=1' }, { cellValue: '=1+2=3' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Equals operator - strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abc"="abc"' }, { cellValue: '="foo"="bar"' }, { cellValue: '="a"="foo"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Equals operator - booleans', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE()=TRUE()' }, { cellValue: '=FALSE()=FALSE()' }, { cellValue: '=TRUE()=FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Equal operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo"=1' }, { cellValue: '="foo"=TRUE()' }, { cellValue: '=1="foo"' }, { cellValue: '=TRUE()="foo"'}],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
    expect(engine.getCellValue(adr('D1'))).toBe(false)
  })

  it('Equals operator with error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1/0' }, { cellValue: '=A1=2' }, { cellValue: '=2=A1' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('Not equals operator - numbers', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1<>2' }, { cellValue: '=1<>1' }, { cellValue: '=1+2<>3' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Not equals operator - strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abc"<>"abc"' }, { cellValue: '="foo"<>"bar"' }, { cellValue: '="a"<>"foo"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Not equals operator - booleans', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE()<>TRUE()' }, { cellValue: '=FALSE()<>FALSE()' }, { cellValue: '=TRUE()<>FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Not equals operator with error', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1/0' }, { cellValue: '=A1<>2' }, { cellValue: '=2<>A1' }],
    ])

    expect(engine.getCellValue(adr('B1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })

  it('Not Equal operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo"<>1' }, { cellValue: '="foo"<>TRUE()' }, { cellValue: '=1<>"foo"' }, { cellValue: '=TRUE()<>"foo"'}],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
  })

  it('Less than operator with number arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1<2' }, { cellValue: '=2<2' }, { cellValue: '=-3<4' }, { cellValue: '=-4<-3'}],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
  })

  it('Less than operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo"<1' }, { cellValue: '="foo"<TRUE()' }, { cellValue: '=1<"0"' }, { cellValue: '=2 < TRUE()'}, {cellValue: '="02/02/2020"<"000"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
    expect(engine.getCellValue(adr('E1'))).toBe(false)
  })

  it('Less than operator with strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abcd"<"abc"' }, { cellValue: '="11"<"2"' }, { cellValue: '="02/02/2020"<"true"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Less than operator with coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FALSE()<"2"' }, { cellValue: '="1"<"2"' }, { cellValue: '=TRUE()<FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Greater than operator with number arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=2>1' }, { cellValue: '=2>2' }, { cellValue: '=4>-3' }, { cellValue: '=-3>-4'}],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
  })

  it('Greater than operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo">1' }, { cellValue: '="foo">TRUE()' }, { cellValue: '=1>"0"' }, { cellValue: '=2 > TRUE()'}, {cellValue: '="02/02/2020">"000"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
    expect(engine.getCellValue(adr('D1'))).toBe(false)
    expect(engine.getCellValue(adr('E1'))).toBe(true)
  })

  it('Greater than operator with strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abcd">"abc"' }, { cellValue: '="11">"2"' }, { cellValue: '="02/02/2020">"true"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Greater than operator with coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FALSE()>"2"' }, { cellValue: '="1">"2"' }, { cellValue: '=TRUE()>FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Less than or equal operator with number arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=1<=2' }, { cellValue: '=2<=2' }, { cellValue: '=-3<=4' }, { cellValue: '=-4<=-3'}, {cellValue: '=5<=4' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
    expect(engine.getCellValue(adr('E1'))).toBe(false)
  })

  it('Less than or equal operator with strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abcd"<="abc"' }, { cellValue: '="11"<="2"' }, { cellValue: '="02/02/2020"<="true"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })
  it('Less than or equal operator with coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FALSE()<="2"' }, { cellValue: '="1"<="2"' }, { cellValue: '=TRUE()<=FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Less than or equal operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo"<=1' }, { cellValue: '="foo"<=TRUE()' }, { cellValue: '=1<="0"' }, { cellValue: '=2 <= TRUE()'}, {cellValue: '="02/02/2020"<="000"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(false)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
    expect(engine.getCellValue(adr('E1'))).toBe(false)
  })

  it('Greater than or equal operator with number arguments', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=2>=1' }, { cellValue: '=2>=2' }, { cellValue: '=4>=-3' }, { cellValue: '=-3>=-4'}, {cellValue: '=4>=5' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(true)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
    expect(engine.getCellValue(adr('D1'))).toBe(true)
    expect(engine.getCellValue(adr('E1'))).toBe(false)
  })

  it('Greater than or equal operator with different types', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="foo">=1' }, { cellValue: '="foo">=TRUE()' }, { cellValue: '=1>="0"' }, { cellValue: '=2 >= TRUE()'}, {cellValue: '="02/02/2020">="000"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
    expect(engine.getCellValue(adr('D1'))).toBe(false)
    expect(engine.getCellValue(adr('E1'))).toBe(true)
  })

  it('Greater than or equal operator with strings', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '="abcd">="abc"' }, { cellValue: '="11">="2"' }, { cellValue: '="02/02/2020">="true"' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(false)
  })

  it('Greater than or equal operator with coercions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FALSE()>="2"' }, { cellValue: '="1">="2"' }, { cellValue: '=TRUE()>=FALSE()' }],
    ])

    expect(engine.getCellValue(adr('A1'))).toBe(true)
    expect(engine.getCellValue(adr('B1'))).toBe(false)
    expect(engine.getCellValue(adr('C1'))).toBe(true)
  })

  it('Less than propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)<2' }, { cellValue: '=2<(1/0)'}, {cellValue: '=(A1:B1)<(1/0)' }, { cellValue: '=(1/0)<(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Greater than propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)>2' }, { cellValue: '=2>(1/0)'}, {cellValue: '=(A1:B1)>(1/0)' }, { cellValue: '=(1/0)>(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Less than or equal propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)<=2' }, { cellValue: '=2<=(1/0)'}, {cellValue: '=(A1:B1)<=(1/0)' }, { cellValue: '=(1/0)<=(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Greater than or equal propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)>=2' }, { cellValue: '=2>=(1/0)'}, {cellValue: '=(A1:B1)>=(1/0)' }, { cellValue: '=(1/0)>=(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Equal propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)=2' }, { cellValue: '=2=(1/0)'}, {cellValue: '=(A1:B1)=(1/0)' }, { cellValue: '=(1/0)=(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
  it('Not equal propagates errors correctly', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '2' }, { cellValue: '=(1/0)<>2' }, { cellValue: '=2<>(1/0)'}, {cellValue: '=(A1:B1)<>(1/0)' }, { cellValue: '=(1/0)<>(A1:B1)' }],
    ])

    expect(engine.getCellValue(adr('C1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('D1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('E1'))).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.ScalarExpected))
    expect(engine.getCellValue(adr('F1'))).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
  })
})
