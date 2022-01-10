import {ErrorType, HyperFormula} from '../src'
import {ErrorMessage} from '../src/error-message'
import {adr, detailedError} from './testUtils'

describe('Rebuilding engine', () => {
  it('should preserve absolute named expression', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [[{ cellValue: '=FALSE' }]]})
    engine.addNamedExpression('FALSE', '=FALSE()')
    engine.rebuildAndRecalculate()
    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(false)
  })

  it('should preserve local named expression', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': { cells: [[{ cellValue: '=FALSE' }]]},
      'Sheet2': { cells: [[{ cellValue: '=FALSE' }]]}
    })
    engine.addNamedExpression('FALSE', '=FALSE()', 0)
    engine.rebuildAndRecalculate()
    expect(engine.getCellValue(adr('A1', 0)).cellValue).toEqual(false)
    expect(engine.getCellValue(adr('A1', 1)).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.NamedExpressionName('FALSE')))
  })

  it('named references should work after rebuild', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': { cells: [[{ cellValue: '42' }, { cellValue: '=FOO' }]]},
    })
    engine.addNamedExpression('FOO', '=Sheet1!$A$1')
    engine.rebuildAndRecalculate()

    expect(engine.getCellValue(adr('B1', 0)).cellValue).toEqual(42)
  })

  it('scopes are properly handled', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Sheet1': { cells: [[{ cellValue: '42' }]]},
      'Sheet2': { cells: [[{ cellValue: '42' }, { cellValue: '=FALSE' }]]},
    }, {}, [{name: 'FALSE', expression: false, scope: 1}])

    engine.removeSheet(0)
    engine.rebuildAndRecalculate()
    expect(engine.getCellValue(adr('B1')).cellValue).toEqual(false)
  })
})
