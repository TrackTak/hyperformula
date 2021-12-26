import {ExportedCellChange, ExportedNamedExpressionChange, HyperFormula} from '../src'
import {ErrorType} from '../src/Cell'
import {Events} from '../src/Emitter'
import {NamedExpressionDoesNotExistError} from '../src/errors'
import AsyncTestPlugin, { getLoadingError } from './helpers/AsyncTestPlugin'

import {adr, detailedErrorWithOrigin} from './testUtils'

describe('Events', () => {
  it('sheetAdded works', function() {
    const [engine] = HyperFormula.buildEmpty()
    const handler = jasmine.createSpy()

    engine.on(Events.SheetAdded, handler)
    engine.addSheet('FooBar')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('FooBar')
  })

  it('sheetRemoved works', function() {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [['=Sheet2!A1']],
      Sheet2: [['42']],
    })
    const handler = jasmine.createSpy()

    engine.on(Events.SheetRemoved, handler)
    engine.removeSheet(1)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('Sheet2', [new ExportedCellChange(adr('A1'), detailedErrorWithOrigin(ErrorType.REF, 'Sheet1!A1'))])
  })

  it('sheetRemoved name contains actual display name', function() {
    const [engine] = HyperFormula.buildFromSheets({
      Sheet1: [['=Sheet2!A1']],
      Sheet2: [['42']],
    })
    const handler = jasmine.createSpy()

    engine.on(Events.SheetRemoved, handler)
    engine.removeSheet(1)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('Sheet2', [new ExportedCellChange(adr('A1'), detailedErrorWithOrigin(ErrorType.REF, 'Sheet1!A1'))])
  })

  it('sheetRenamed works', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    const handler = jasmine.createSpy()

    engine.on(Events.SheetRenamed, handler)
    engine.renameSheet(0, 'SomeNewName')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('Sheet1', 'SomeNewName')
  })

  it('sheetRenamed is not triggered when sheet didnt change', () => {
    const [engine] = HyperFormula.buildFromArray([[]])
    const handler = jasmine.createSpy()

    engine.on(Events.SheetRenamed, handler)
    engine.renameSheet(0, 'Sheet1')

    expect(handler).not.toHaveBeenCalled()
  })

  it('namedExpressionAdded works', () => {
    const [engine] = HyperFormula.buildEmpty()
    const handler = jasmine.createSpy()

    engine.on(Events.NamedExpressionAdded, handler)
    engine.addNamedExpression('myName', 'foobarbaz')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('myName', [new ExportedNamedExpressionChange('myName', 'foobarbaz')])
  })

  it('namedExpressionRemoved works', () => {
    const [engine] = HyperFormula.buildEmpty()
    engine.addNamedExpression('myName', 'foobarbaz')
    const handler = jasmine.createSpy()

    engine.on(Events.NamedExpressionRemoved, handler)
    engine.removeNamedExpression('myName')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('myName', [])
  })

  it('namedExpressionRemoved throws error when named expression not exists', () => {
    const [engine] = HyperFormula.buildEmpty()
    const handler = jasmine.createSpy()

    engine.on(Events.NamedExpressionRemoved, handler)
    expect(() => {
      engine.removeNamedExpression('myName')
    }).toThrow(new NamedExpressionDoesNotExistError('myName'))
  })

  it('namedExpressionRemoved contains actual named expression name', () => {
    const [engine] = HyperFormula.buildEmpty()
    engine.addNamedExpression('myName', 'foobarbaz')
    const handler = jasmine.createSpy()

    engine.on(Events.NamedExpressionRemoved, handler)
    engine.removeNamedExpression('MYNAME')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('myName', [])
  })

  it('valuesUpdated works', () => {
    const [engine] = HyperFormula.buildFromArray([
      ['42']
    ])
    const handler = jasmine.createSpy()

    engine.on(Events.ValuesUpdated, handler)
    engine.setCellContents(adr('A1'), [['43']])

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 43)])
  })

  it('asyncValuesUpdated works', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine] = HyperFormula.buildFromArray([
      ['=ASYNC_FOO()']
    ])
    const handler = jasmine.createSpy()

    engine.on(Events.AsyncValuesUpdated, handler)

    await engine.setCellContents(adr('B1'), [['=ASYNC_FOO()']])[1]

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('B1'), 1)])
  })


  it('valuesUpdated may sometimes be triggered even if nothing changed', () => {
    const [engine] = HyperFormula.buildFromArray([
      ['42']
    ])
    const handler = jasmine.createSpy()

    engine.on(Events.ValuesUpdated, handler)
    engine.setCellContents(adr('A1'), [['42']])

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 42)])
  })

  it.only('suspension and resuming of evaluation', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([
      ['42', '=ASYNC_FOO()']
    ])
    const handlerUpdated = jasmine.createSpy()
    const handlerSuspended = jasmine.createSpy()
    const handlerResumed = jasmine.createSpy()
    const handlerAsyncValuesUpdated = jasmine.createSpy()

    engine.on(Events.ValuesUpdated, handlerUpdated)
    engine.on(Events.EvaluationSuspended, handlerSuspended)
    engine.on(Events.EvaluationResumed, handlerResumed)
    engine.on(Events.AsyncValuesUpdated, handlerAsyncValuesUpdated)

    await promise

    engine.suspendEvaluation()
    expect(handlerUpdated).toHaveBeenCalledTimes(0)
    expect(handlerSuspended).toHaveBeenCalledTimes(1)
    expect(handlerResumed).toHaveBeenCalledTimes(0)
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledTimes(1)

    await engine.setCellContents(adr('A1'), [['13']])[1]

    expect(handlerUpdated).toHaveBeenCalledTimes(0)
    expect(handlerSuspended).toHaveBeenCalledTimes(1)
    expect(handlerResumed).toHaveBeenCalledTimes(0)
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledTimes(1)

    await engine.resumeEvaluation()[1]

    expect(handlerUpdated).toHaveBeenCalledTimes(1)
    expect(handlerSuspended).toHaveBeenCalledTimes(1)
    expect(handlerResumed).toHaveBeenCalledTimes(2)
    expect(handlerResumed).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 13)])
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledTimes(1)
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledWith([new ExportedCellChange(adr('B1'), 1)])
  })

  it('batching', async() => {
    HyperFormula.registerFunctionPlugin(AsyncTestPlugin, AsyncTestPlugin.translations)

    const [engine, promise] = HyperFormula.buildFromArray([
      ['42']
    ])

    await promise

    const handlerUpdated = jasmine.createSpy()
    const handlerSuspended = jasmine.createSpy()
    const handlerResumed = jasmine.createSpy()
    const handlerAsyncValuesUpdated = jasmine.createSpy()

    engine.on(Events.ValuesUpdated, handlerUpdated)
    engine.on(Events.EvaluationSuspended, handlerSuspended)
    engine.on(Events.EvaluationResumed, handlerResumed)
    engine.on(Events.AsyncValuesUpdated, handlerAsyncValuesUpdated)

    await engine.batch(() => engine.setCellContents(adr('A1'), [['13', '=ASYNC_FOO()']]))[1]

    expect(handlerUpdated).toHaveBeenCalledTimes(1)
    expect(handlerSuspended).toHaveBeenCalledTimes(1)
    expect(handlerResumed).toHaveBeenCalledTimes(2)
    expect(handlerResumed).toHaveBeenCalledWith([new ExportedCellChange(adr('A1'), 13), new ExportedCellChange(adr('B1'), getLoadingError('Sheet1!B1'))])
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledTimes(1)
    expect(handlerAsyncValuesUpdated).toHaveBeenCalledWith([new ExportedCellChange(adr('B1'), 1)])
  })
})

describe('Subscribing only once', () => {
  it('works', function() {
    const [engine] = HyperFormula.buildEmpty()
    const handler = jasmine.createSpy()

    engine.once(Events.SheetAdded, handler)
    engine.addSheet('FooBar1')
    engine.addSheet('FooBar2')

    expect(handler).toHaveBeenCalledTimes(1)
  })
})

describe('Unsubscribing', () => {
  it('works', function() {
    const [engine] = HyperFormula.buildEmpty()
    const handler = jasmine.createSpy()
    engine.on(Events.SheetAdded, handler)
    engine.addSheet('FooBar1')

    engine.off(Events.SheetAdded, handler)
    engine.addSheet('FooBar2')

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
