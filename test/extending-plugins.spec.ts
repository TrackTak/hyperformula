import {ErrorType, HyperFormula} from '../src'
import {ErrorMessage} from '../src/error-message'
import {InterpreterState} from '../src/interpreter/InterpreterState'
import {FunctionPlugin, FunctionPluginTypecheck} from '../src/interpreter/plugin/FunctionPlugin'
import {ProcedureAst} from '../src/parser'
import {adr, detailedError} from './testUtils'

class FooPlugin extends FunctionPlugin implements FunctionPluginTypecheck<FooPlugin> {
  public static implementedFunctions = {
    'FOO': {
      method: 'foo',
    },
  }

  public foo(_ast: ProcedureAst, _state: InterpreterState) {
    return 42
  }
}

describe('Plugins', () => {
  it('Extending with a plugin', () => {
    HyperFormula.getLanguage('enGB').extendFunctions({'FOO': 'FOO'})
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=foo()' }],
    ] }, {functionPlugins: [FooPlugin]})

    expect(engine.getCellValue(adr('A1')).cellValue).toBe(42)
  })

  it('cleanup', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=foo()' }],
    ] }, {functionPlugins: [FooPlugin]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NAME, ErrorMessage.FunctionName('FOO')))
  })
})
