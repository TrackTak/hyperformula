import {HyperFormula} from '../../src'
import {adr} from '../testUtils'

describe('Criterions - operators computations', () => {
  it('usage of greater than operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, ">1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(7)
  })

  it('usage of greater than or equal operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, ">=1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(12)
  })

  it('usage of less than operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A2, "<1", B1:B2)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(3)
  })

  it('usage of less than or equal operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, "<=1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(8)
  })

  it('usage of equal operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, "=1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(5)
  })

  it('usage of not equal operator', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '0' }, { cellValue: '3' }],
      [{ cellValue: '1' }, { cellValue: '5' }],
      [{ cellValue: '2' }, { cellValue: '7' }],
      [{ cellValue: '=SUMIF(A1:A3, "<>1", B1:B3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(10)
  })

  it('empty values #1', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '' }],
      [{ cellValue: '2' }, { cellValue: '8' }],
      [{ cellValue: '3' }, { cellValue: '9' }],
      [{ cellValue: '=SUMIF(B1:B3, "=", A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(0)
  })

  it('empty values #2', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '' }],
      [{ cellValue: '2' }, { cellValue: '8' }],
      [{ cellValue: '3' }, { cellValue: '9' }],
      [{ cellValue: '=SUMIF(B1:B3, "<>", A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(6)
  })

  it('empty values #3', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: ' ' }],
      [{ cellValue: '2' }, { cellValue: '1' }],
      [{ cellValue: '3' }, { cellValue: 'TRUE' }],
      [{ cellValue: '=SUMIF(B1:B3, "=0", A1:A3)' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(0)
  })

  it('empty values #4', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '' }],
      [{ cellValue: '8' }],
      [{ cellValue: '9' }],
      [{ cellValue: '=COUNTIF(A1:A3, "=")' }],
    ])

    expect(engine.getCellValue(adr('A4'))).toEqual(0)
  })
})

describe('big test', () => {
  it('regex example', () => {
    const formulas = [
      ['w b 2r2 x', 8.89999999999418, null, 'w', '[^hrcsx]*w ?f?', '=COUNTIF(A1:A49,E1)', '=SUMIF($A$1:$A$49,E1,$B$1:$B$49)'],
      ['w F', 2.20000000001164, null, 'w b', '[^hrcsx]*w*b ?f?', '=COUNTIF(A2:A50,E2)', '=SUMIF($A$1:$A$49,E2,$B$1:$B$49)'],
      ['w', 2.19999999999709, null, 'r &/or c', '[^hsx]*[cr][^hsx]*', '=COUNTIF(A3:A51,E3)', '=SUMIF($A$1:$A$49,E3,$B$1:$B$49)'],
      ['w', 2.09999999999127, null, '1h', '.*1h[^sx]*', '=COUNTIF(A4:A52,E4)', '=SUMIF($A$1:$A$49,E4,$B$1:$B$49)'],
      ['w b 1c2 x', 2.40000000000873, null, '2h', '.*2h[^sx]*', '=COUNTIF(A5:A53,E5)', '=SUMIF($A$1:$A$49,E5,$B$1:$B$49)'],
      ['w 1c1 F', 4.39999999999418, null, '1h 1s', '.*1h.*1s.*[^x]', '=COUNTIF(A9:A57,E6)', '=SUMIF($A$1:$A$49,E6,$B$1:$B$49)'],
      ['w b F', 2.30000000000291, null, '2h 1s', '.*2h.*1s.*[^x]', '=COUNTIF(A11:A59,E7)', '=SUMIF($A$1:$A$49,E7,$B$1:$B$49)'],
      ['w F', 2.30000000000291, null, '3h 1s', '.*3h.*1s.*[^x]', '=COUNTIF(A12:A60,E8)', '=SUMIF($A$1:$A$49,E8,$B$1:$B$49)'],
      ['w F', 2.09999999999127, null, '2h 2s', '.*2h.*2s.*[^x]', '=COUNTIF(A15:A63,E9)', '=SUMIF($A$1:$A$49,E9,$B$1:$B$49)'],
      ['w F b', 2.20000000001164, null, '3h 2s', '.*3h.*2s.*[^x]', '=COUNTIF(A16:A64,E10)', '=SUMIF($A$1:$A$49,E10,$B$1:$B$49)'],
      ['w', 2.29999999998836, null, '4h 2s', '.*4h.*2s.*[^x]', '=COUNTIF(A19:A67,E11)', '=SUMIF($A$1:$A$49,E11,$B$1:$B$49)'],
      ['w 2r2', 3.30000000000291, null, '5h 2s', '.*5h.*2s.*[^x]', '=COUNTIF(A20:A68,E12)', '=SUMIF($A$1:$A$49,E12,$B$1:$B$49)'],
      ['w  1r3', 2.30000000000291, null, '4h 3s', '.*4h.*3s.*[^x]', '=COUNTIF(A22:A70,E13)', '=SUMIF($A$1:$A$49,E13,$B$1:$B$49)'],
      ['wF', 3.39999999999418, null, '5h 3s', '.*5h.*3s.*[^x]', '=COUNTIF(A23:A71,E14)', '=SUMIF($A$1:$A$49,E14,$B$1:$B$49)'],
      ['wF', 3.20000000001164, null, '5h 4s', '.*5h.*4s.*[^x]', '=COUNTIF(A24:A72,E15)', '=SUMIF($A$1:$A$49,E15,$B$1:$B$49)'],
      ['wF', 3.29999999998836, null, '6h 4s', '.*6h.*4s.*[^x]', '=COUNTIF(A26:A74,E16)', '=SUMIF($A$1:$A$49,E16,$B$1:$B$49)'],
      ['wF', 3.30000000000291, null, '7h 4s', '.*7h.*4s.*[^x]', '=COUNTIF(A28:A76,E17)', '=SUMIF($A$1:$A$49,E17,$B$1:$B$49)'],
      ['wF', 3.30000000000291, null, '7h 5s', '.*7h.*5s.*[^x]', '=COUNTIF(A29:A77,E18)', '=SUMIF($A$1:$A$49,E18,$B$1:$B$49)'],
      ['w F 2r3', 5.60000000000582, null, '9h 9s', '.*9h.*9s.*[^x]', '=COUNTIF(A30:A78,E19)', '=SUMIF($A$1:$A$49,E19,$B$1:$B$49)'],
      ['w 2r1', 3.29999999998836, null, 'x', '.*x.*', '=COUNTIF(A1:A49,E20)', '=SUMIF($A$1:$A$49,E20,$B$1:$B$49)'],
      ['w F 2r1', 4.5],
      ['w 1r2', 3.30000000000291],
      ['w b 2r1 1c1', 5.60000000000582],
      ['w 1r1 1c1', 3.30000000000291],
      ['w F', 2.29999999998836],
      ['F w', 2.20000000001164],
      ['Fw', 2.19999999999709],
      ['w 2r2 1c1', 5.59999999999127],
      ['w 1c2', 2.20000000001164],
      ['w 2r2 1h1 F x', 6.59999999999127],
      ['w 2r2 1h1 x', 6.69999999999709],
      ['w 2h1 F', 5.60000000000582],
      ['w 2h1', 6.60000000000582],
      ['F w 2h1', 5.59999999999127],
      ['w 2h1', 6.69999999999709],
      ['w 2h1', 6.60000000000582],
      ['w 2h1 1s1', 13.3999999999942],
      ['w 2h1 1s1', 11.1000000000058],
      ['w 2h1 1s1 F', 11.1000000000058],
      ['w 2h1 1s1 F b', 12.1999999999971],
      ['w 2h1 1s1', 11.0999999999913],
      ['w 2h1 1s1 F b', 12.2000000000116],
      ['w 2h1 1s1 F', 11.0999999999913],
      ['w 3h1 1s1 F', 11.1999999999971],
      ['w 3h1 1s1 F', 12.2000000000116],
      ['w 3h1 1s1 F 1r1', 12.1999999999971],
      ['w 3h1 1s1 Fx', 24.5],
      [{ cellValue: 'w 3h1 1s1 F' }, { cellValue: 10 }],
      ['w 3h1 1s1 F', 12.1999999999971],
      [],
      [{ cellValue: '=COUNTA(A1:A49)' }, { cellValue: '=SUM(B1:B50)' }, { cellValue: null }, { cellValue: null}, {cellValue: 'codes counted  >  ' }, { cellValue: '=SUM(F1:F20)' }, { cellValue: '=SUM(G1:G21)' }],
    ]

    const [engine] = HyperFormula.buildFromArray(formulas, {useRegularExpressions: true, precisionRounding: 13})

    expect(engine.getCellValue(adr('B51'))).toEqual(304.5)
    expect(engine.getCellValue(adr('G51'))).toEqual(304.5)

    expect(engine.getCellValue(adr('F1'))).toEqual(14)
    expect(engine.getCellValue(adr('F2'))).toEqual(2)
    expect(engine.getCellValue(adr('F3'))).toEqual(11)
    expect(engine.getCellValue(adr('F4'))).toEqual(0)
    expect(engine.getCellValue(adr('F5'))).toEqual(5)
    expect(engine.getCellValue(adr('F6'))).toEqual(0)
    expect(engine.getCellValue(adr('F7'))).toEqual(7)
    expect(engine.getCellValue(adr('F8'))).toEqual(5)
    expect(engine.getCellValue(adr('F9'))).toEqual(0)
    expect(engine.getCellValue(adr('F10'))).toEqual(0)
    expect(engine.getCellValue(adr('F11'))).toEqual(0)
    expect(engine.getCellValue(adr('F12'))).toEqual(0)
    expect(engine.getCellValue(adr('F13'))).toEqual(0)
    expect(engine.getCellValue(adr('F14'))).toEqual(0)
    expect(engine.getCellValue(adr('F15'))).toEqual(0)
    expect(engine.getCellValue(adr('F16'))).toEqual(0)
    expect(engine.getCellValue(adr('F17'))).toEqual(0)
    expect(engine.getCellValue(adr('F18'))).toEqual(0)
    expect(engine.getCellValue(adr('F19'))).toEqual(0)
    expect(engine.getCellValue(adr('F20'))).toEqual(5)

    expect(engine.getCellValue(adr('G1'))).toEqual(36.39999999998)
    expect(engine.getCellValue(adr('G2'))).toEqual(4.5000000000146)
    expect(engine.getCellValue(adr('G3'))).toEqual(43.400000000009)
    expect(engine.getCellValue(adr('G4'))).toEqual(0)
    expect(engine.getCellValue(adr('G5'))).toEqual(31.100000000006)
    expect(engine.getCellValue(adr('G6'))).toEqual(0)
    expect(engine.getCellValue(adr('G7'))).toEqual(82.199999999997)
    expect(engine.getCellValue(adr('G8'))).toEqual(57.800000000003)
    expect(engine.getCellValue(adr('G9'))).toEqual(0)
    expect(engine.getCellValue(adr('G10'))).toEqual(0)
    expect(engine.getCellValue(adr('G11'))).toEqual(0)
    expect(engine.getCellValue(adr('G12'))).toEqual(0)
    expect(engine.getCellValue(adr('G13'))).toEqual(0)
    expect(engine.getCellValue(adr('G14'))).toEqual(0)
    expect(engine.getCellValue(adr('G15'))).toEqual(0)
    expect(engine.getCellValue(adr('G16'))).toEqual(0)
    expect(engine.getCellValue(adr('G17'))).toEqual(0)
    expect(engine.getCellValue(adr('G18'))).toEqual(0)
    expect(engine.getCellValue(adr('G19'))).toEqual(0)
    expect(engine.getCellValue(adr('G20'))).toEqual(49.099999999991)
  })

  it('Gnumeric test file', () => {
    const formulas = [
      [{ cellValue: null }, { cellValue: null }, { cellValue: '=IF(AND(C10:C49), "All ok", "Bug!")' }],
      [],
      [],
      [],
      [],
      ['1', null, null, null, '1', null, null, 'TRUE', null, null, 'TRUE', '\'1', 'Jesper'],
      ['2', '8', null, null, '2', '1', null, 'FALSE', '8', null, '\'TRUE', '1', 'apples'],
      ['3', '9', null, null, '3', 'TRUE', null, '\'1.0', '9', null, null, '\'1.0', ],
      [],
      [{ cellValue: '=SUMIF($B$6:$B$8, "=", $A$6:$A$8)' }, { cellValue: '1' }, { cellValue: '=A10=B10' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, ">=", $A$6:$A$8)' }, { cellValue: '0' }, { cellValue: '=A11=B11' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "<=", $A$6:$A$8)' }, { cellValue: '0' }, { cellValue: '=A12=B12' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "<>", $A$6:$A$8)' }, { cellValue: '5' }, { cellValue: '=A13=B13' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "<>x", $A$6:$A$8)' }, { cellValue: '6' }, { cellValue: '=A14=B14' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, ">", $A$6:$A$8)' }, { cellValue: '0' }, { cellValue: '=A15=B15' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "<", $A$6:$A$8)' }, { cellValue: '0' }, { cellValue: '=A16=B16' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "=8.0", $A$6:$A$8)' }, { cellValue: '2' }, { cellValue: '=A17=B17' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "= 8.0", $A$6:$A$8)' }, { cellValue: '2' }, { cellValue: '=A18=B18' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "= 8.0 ", $A$6:$A$8)' }, { cellValue: '2' }, { cellValue: '=A19=B19' }],
      [{ cellValue: '=SUMIF($B$6:$B$8, "= 8.0 ", $A$6:$A$8)' }, { cellValue: '2' }, { cellValue: '=A20=B20' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=TRUE", $E$6:$E$8)' }, { cellValue: '3' }, { cellValue: '=A21=B21' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=1", $E$6:$E$8)' }, { cellValue: '2' }, { cellValue: '=A22=B22' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=0", $E$6:$E$8)' }, { cellValue: '0' }, { cellValue: '=A23=B23' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=FALSE", $E$6:$E$8)' }, { cellValue: '0' }, { cellValue: '=A24=B24' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=T", $E$6:$E$8)' }, { cellValue: '0' }, { cellValue: '=A25=B25' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=1.0", $E$6:$E$8)' }, { cellValue: '2' }, { cellValue: '=A26=B26' }],
      [{ cellValue: '=SUMIF($F$6:$F$8, "=x", $E$6:$E$8)' }, { cellValue: '0' }, { cellValue: '=A27=B27' }],
      [{ cellValue: '=SUMIF($I$6:$I$8, "=", $H$6:$H$8)' }, { cellValue: '0' }, { cellValue: '=A28=B28' }],
      [{ cellValue: '=SUMIF($I$6:$I$8, "=9", $H$6:$H$8)' }, { cellValue: '0' }, { cellValue: '=A29=B29' }],
      [{ cellValue: '=SUMIF($I$6:$I$8, "=1.0", $H$6:$H$8)' }, { cellValue: '0' }, { cellValue: '=A30=B30' }],
      [{ cellValue: '=COUNTIF($I$6:$I$8, "=")' }, { cellValue: '1' }, { cellValue: '=A31=B31' }],
      [{ cellValue: '=COUNTIF($H$6:$H$8, "1")' }, { cellValue: '1' }, { cellValue: '=A32=B32' }],
      [{ cellValue: '=SUMIF($H$6:$H$8, "=TRUE")' }, { cellValue: '0' }, { cellValue: '=A33=B33' }],
      [{ cellValue: '=COUNTIF($K$6:$K$6, "TRUE")' }, { cellValue: '1' }, { cellValue: '=A34=B34' }],
      [{ cellValue: '=COUNTIF($K$6:$K$6, TRUE)' }, { cellValue: '1' }, { cellValue: '=A35=B35' }],
      [{ cellValue: '=COUNTIF($K$7:$K$7, "TRUE")' }, { cellValue: '0' }, { cellValue: '=A36=B36' }],
      [{ cellValue: '=COUNTIF($K$7:$K$7, TRUE)' }, { cellValue: '0' }, { cellValue: '=A37=B37' }],
      [{ cellValue: '=COUNTIF($K$6:$K$8, "TRUE")' }, { cellValue: '1' }, { cellValue: '=A38=B38' }],
      [{ cellValue: '=COUNTIF($K$6:$K$8, "=TRUE")' }, { cellValue: '1' }, { cellValue: '=A39=B39' }],
      [{ cellValue: '=COUNTIF($K$6:$K$8, "~TRUE")' }, { cellValue: '0' }, { cellValue: '=A40=B40' }],
      [{ cellValue: '=COUNTIF($K$6:$K$8, TRUE)' }, { cellValue: '1' }, { cellValue: '=A41=B41' }],
      [{ cellValue: '=COUNTIF($L$6:$L$8, "1")' }, { cellValue: '3' }, { cellValue: '=A42=B42' }],
      [{ cellValue: '=COUNTIF($L$6:$L$8, "1.0")' }, { cellValue: '3' }, { cellValue: '=A43=B43' }],
      [{ cellValue: '=COUNTIF($L$6:$L$8, 1)' }, { cellValue: '3' }, { cellValue: '=A44=B44' }],
      [{ cellValue: '=COUNTIF($M$6:$M$7, "es")' }, { cellValue: '0' }, { cellValue: '=A45=B45' }],
      [{ cellValue: '=COUNTIF($M$6:$M$7, "*es")' }, { cellValue: '1' }, { cellValue: '=A46=B46' }],
      [{ cellValue: '=COUNTIF($M$6:$M$7, "es*")' }, { cellValue: '0' }, { cellValue: '=A47=B47' }],
      [{ cellValue: '=COUNTIF($M$6:$M$7, "*es*")' }, { cellValue: '2' }, { cellValue: '=A48=B48' }],
      [{ cellValue: '=COUNTIF($M$6:$M$7, "*ES*")' }, { cellValue: '2' }, { cellValue: '=A49=B49' }]
    ]
    const [engine] = HyperFormula.buildFromArray([])
    engine.addNamedExpression('TRUE', '=TRUE()', undefined)
    engine.addNamedExpression('FALSE', '=FALSE()', undefined)
    engine.setCellContents(adr('A1'), formulas)
    expect(engine.getCellValue(adr('A10'))).toEqual(1)
    expect(engine.getCellValue(adr('A11'))).toEqual(0)
    expect(engine.getCellValue(adr('A12'))).toEqual(0)
    expect(engine.getCellValue(adr('A13'))).toEqual(5)
    expect(engine.getCellValue(adr('A14'))).toEqual(6)
    expect(engine.getCellValue(adr('A15'))).toEqual(0)
    expect(engine.getCellValue(adr('A16'))).toEqual(0)
    expect(engine.getCellValue(adr('A17'))).toEqual(2)
    expect(engine.getCellValue(adr('A18'))).toEqual(2)
    expect(engine.getCellValue(adr('A19'))).toEqual(2)
    expect(engine.getCellValue(adr('A20'))).toEqual(2)
    expect(engine.getCellValue(adr('A21'))).toEqual(3)
    expect(engine.getCellValue(adr('A22'))).toEqual(2)
    expect(engine.getCellValue(adr('A23'))).toEqual(0)
    expect(engine.getCellValue(adr('A24'))).toEqual(0)
    expect(engine.getCellValue(adr('A25'))).toEqual(0)
    expect(engine.getCellValue(adr('A26'))).toEqual(2)
    expect(engine.getCellValue(adr('A27'))).toEqual(0)
    expect(engine.getCellValue(adr('A28'))).toEqual(0)
    expect(engine.getCellValue(adr('A29'))).toEqual(0)
    expect(engine.getCellValue(adr('A30'))).toEqual(0)
    expect(engine.getCellValue(adr('A31'))).toEqual(1)
    expect(engine.getCellValue(adr('A32'))).toEqual(1)
    expect(engine.getCellValue(adr('A33'))).toEqual(0)
    expect(engine.getCellValue(adr('A34'))).toEqual(1)
    // expect(engine.getCellValue(adr('A35'))).toEqual(1)
    expect(engine.getCellValue(adr('A36'))).toEqual(0)
    // expect(engine.getCellValue(adr('A37'))).toEqual(0)
    expect(engine.getCellValue(adr('A38'))).toEqual(1)
    expect(engine.getCellValue(adr('A39'))).toEqual(1)
    // expect(engine.getCellValue(adr('A40'))).toEqual(0)
    // expect(engine.getCellValue(adr('A41'))).toEqual(1)
    expect(engine.getCellValue(adr('A42'))).toEqual(3)
    expect(engine.getCellValue(adr('A43'))).toEqual(3)
    // expect(engine.getCellValue(adr('A44'))).toEqual(3)
    expect(engine.getCellValue(adr('A45'))).toEqual(0)
    expect(engine.getCellValue(adr('A46'))).toEqual(1)
    expect(engine.getCellValue(adr('A47'))).toEqual(0)
    expect(engine.getCellValue(adr('A48'))).toEqual(2)
    expect(engine.getCellValue(adr('A49'))).toEqual(2)
    // expect(engine.getCellValue(adr('C1'))).toEqual('All ok')
  })
})
