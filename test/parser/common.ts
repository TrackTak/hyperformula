import {Config} from '../../src/Config'
import {SheetMapping} from '../../src/DependencyGraph'
import {buildTranslationPackage} from '../../src/i18n'
import {enGB} from '../../src/i18n/languages'
import {FunctionRegistry} from '../../src/interpreter/FunctionRegistry'
import {ParserWithCaching} from '../../src/parser'

export function buildEmptyParserWithCaching(config: Config, sheetMapping?: SheetMapping): ParserWithCaching {
  sheetMapping = sheetMapping || new SheetMapping(buildTranslationPackage(enGB))
  const functionRegistry = new FunctionRegistry(config)

  return new ParserWithCaching(config, functionRegistry, sheetMapping.get)
}
