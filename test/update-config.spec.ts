import {HyperFormula} from '../src'
import {ErrorType} from '../src/Cell'
import {ErrorMessage} from '../src/error-message'
import {plPL} from '../src/i18n/languages'
import {adr, detailedError} from './testUtils'

describe('update config', () => {
  it('simple reload preserves all values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=A1' }, { cellValue: '=SUM(A1:B1)' }],
      [{ cellValue: '#DIV/0!' }, { cellValue: '=B2' }, { cellValue: '=F(' }]
    ])
    engine.updateConfig({})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(1)
    expect(engine.getCellValue(adr('C1')).cellValue).toBe(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.DIV_BY_ZERO))
    expect(engine.getCellValue(adr('B2')).cellValue).toEqualError(detailedError(ErrorType.CYCLE))
    expect(engine.getCellValue(adr('C2')).cellValue).toEqualError(detailedError(ErrorType.ERROR, ErrorMessage.ParseError))
  })
  it('simple reload preserves formulas', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1' }, { cellValue: '=A1' }, { cellValue: '=SUM(A1:B1)' }],
      [{ cellValue: '#DIV/0!' }, { cellValue: '=B2' }, { cellValue: '=F(' }]
    ])
    engine.updateConfig({})

    expect(engine.getCellFormula(adr('B1')).cellValue).toBe('=A1')
    expect(engine.getCellFormula(adr('C1')).cellValue).toBe('=SUM(A1:B1)')
    expect(engine.getCellFormula(adr('B2')).cellValue).toBe('=B2')
    expect(engine.getCellFormula(adr('C2')).cellValue).toBe('=F(')
  })

  it('simple reload preserves values', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '1.00000000000001' }, { cellValue: '1' }, { cellValue: '=A1-B1' }],
    ], {smartRounding: false})
    expect(engine.getCellValue(adr('C1')).cellValue).toBeCloseTo(0.00000000000001)

    engine.updateConfig({smartRounding: true})

    expect(engine.getCellValue(adr('C1')).cellValue).toEqual(0)
  })
  it('language reload', () => {
    HyperFormula.registerLanguage('plPL', plPL)
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=FOO()' }, { cellValue: '=SUM()' }, { cellValue: '=SUMA()' }, { cellValue: 'SUM()'}, {cellValue: '=SUM(' }],
    ])
    engine.updateConfig({language: 'plPL'})

    expect(engine.getCellFormula(adr('A1')).cellValue).toBe('=FOO()')
    expect(engine.getCellFormula(adr('B1')).cellValue).toBe('=SUMA()')
    expect(engine.getCellFormula(adr('C1')).cellValue).toBe('=SUMA()')
    expect(engine.getCellFormula(adr('D1')).cellValue).toBe(undefined)
    expect(engine.getCellFormula(adr('E1')).cellValue).toBe('=SUM(')
  })

  it('simple reload preserves namedexpressions', () => {
    const [engine] = HyperFormula.buildFromArray([
      [{ cellValue: '=TRUE' }, { cellValue: '=FALSE' }],
    ])
    engine.addNamedExpression('TRUE', true)
    engine.addNamedExpression('FALSE', false)
    engine.updateConfig({})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(true)
    expect(engine.getCellValue(adr('B1')).cellValue).toBe(false)
  })
})
