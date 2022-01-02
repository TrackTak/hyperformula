import {ErrorType} from '../src/Cell'
import {CellContent, CellContentParser} from '../src/CellContentParser'
import {Config} from '../src/Config'
import {DateTimeHelper} from '../src/DateTimeHelper'
import {ErrorMessage} from '../src/error-message'
import {
  CellData,
  CurrencyNumber,
  DateNumber,
  DateTimeNumber,
  PercentNumber,
  TimeNumber
} from '../src/interpreter/InterpreterValue'
import {NumberLiteralHelper} from '../src/NumberLiteralHelper'

describe('CellContentParser', () => {
  const config = new Config()
  const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

  it('a formula', () => {
    expect(cellContentParser.parse('=FOO()').cellValue).toEqual(new CellContent.Formula('=FOO()'))
  })

  it('null is empty value', () => {
    expect(cellContentParser.parse(null).cellValue).toEqual(new CellContent.Empty())
  })

  it('undefined is empty value', () => {
    expect(cellContentParser.parse(undefined).cellValue).toEqual(new CellContent.Empty())
  })

  it('cell data with value and metadata', () => {
    expect(cellContentParser.parse({
      cellValue: 'value',
      metadata: {
        test: 3
      }
    })).toEqual(new CellData(new CellContent.String('value'), {
      test: 3
    }))
  })

  it('cell data with no value and metadata', () => {
    expect(cellContentParser.parse({
      cellValue: undefined,
      metadata: {
        test: 3
      }
    })).toEqual(new CellData(new CellContent.OnlyMetadata(), {
      test: 3
    }))
  })

  it('cell data with value and no metadata', () => {
    expect(cellContentParser.parse({
      cellValue: 3,
    })).toEqual(new CellData(new CellContent.Number(3)))
  })

  it('numbers', () => {
    expect(cellContentParser.parse('42').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse('+42').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse(' 42').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse('42 ').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse('42.13').cellValue).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse('-42.13').cellValue).toEqual(new CellContent.Number(-42.13))
    expect(cellContentParser.parse('+42.13').cellValue).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse('.13').cellValue).toEqual(new CellContent.Number(0.13))
  })

  it('boolean', () => {
    expect(cellContentParser.parse('true').cellValue).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse('false').cellValue).toEqual(new CellContent.Boolean(false))
    expect(cellContentParser.parse('TRUE').cellValue).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse('FALSE').cellValue).toEqual(new CellContent.Boolean(false))
    expect(cellContentParser.parse('TrUe').cellValue).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse('faLSE').cellValue).toEqual(new CellContent.Boolean(false))
  })

  it('numbers with different decimal separators', () => {
    const config = new Config({decimalSeparator: ',', functionArgSeparator: ';'})
    const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

    expect(cellContentParser.parse('42').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse('42,13').cellValue).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse('-42,13').cellValue).toEqual(new CellContent.Number(-42.13))
    expect(cellContentParser.parse('+42,13').cellValue).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse(',13').cellValue).toEqual(new CellContent.Number(0.13))
    expect(cellContentParser.parse('42.13').cellValue).toEqual(new CellContent.String('42.13'))
    expect(cellContentParser.parse('12,34,56').cellValue).toEqual(new CellContent.String('12,34,56'))
  })

  it('numbers with thousand separators', () => {
    const config = new Config({thousandSeparator: ' ', functionArgSeparator: ';'})
    const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

    expect(cellContentParser.parse('42').cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse('1234567').cellValue).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse('1 234 567').cellValue).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse('-1 234 567').cellValue).toEqual(new CellContent.Number(-1234567))
    expect(cellContentParser.parse('1234 567').cellValue).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse('12 3456 789').cellValue).toEqual(new CellContent.Number(123456789))
    expect(cellContentParser.parse('1 234 567.12').cellValue).toEqual(new CellContent.Number(1234567.12))
    expect(cellContentParser.parse('12 34 56 7').cellValue).toEqual(new CellContent.String('12 34 56 7'))
    expect(cellContentParser.parse('1 234.12.12').cellValue).toEqual(new CellContent.String('1 234.12.12'))
  })

  it('non-string', () => {
    expect(cellContentParser.parse(42).cellValue).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse(true).cellValue).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse(null).cellValue).toEqual(new CellContent.Empty())
    expect(cellContentParser.parse(undefined).cellValue).toEqual(new CellContent.Empty())
    expect(cellContentParser.parse(-0).cellValue).toEqual(new CellContent.Number(0))
    expect(cellContentParser.parse(Infinity).cellValue).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(cellContentParser.parse(-Infinity).cellValue).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(cellContentParser.parse(NaN).cellValue).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('string', () => {
    expect(cellContentParser.parse('f42').cellValue).toEqual(new CellContent.String('f42'))
    expect(cellContentParser.parse('42f').cellValue).toEqual(new CellContent.String('42f'))
    expect(cellContentParser.parse(' =FOO()').cellValue).toEqual(new CellContent.String(' =FOO()'))
    expect(cellContentParser.parse(' ').cellValue).toEqual(new CellContent.String(' '))
    expect(cellContentParser.parse('').cellValue).toEqual(new CellContent.String(''))
  })

  it('errors', () => {
    expect(cellContentParser.parse('#DIV/0!').cellValue).toEqual(new CellContent.Error(ErrorType.DIV_BY_ZERO))
    expect(cellContentParser.parse('#NUM!').cellValue).toEqual(new CellContent.Error(ErrorType.NUM))
    expect(cellContentParser.parse('#N/A').cellValue).toEqual(new CellContent.Error(ErrorType.NA))
    expect(cellContentParser.parse('#VALUE!').cellValue).toEqual(new CellContent.Error(ErrorType.VALUE))
    expect(cellContentParser.parse('#CYCLE!').cellValue).toEqual(new CellContent.Error(ErrorType.CYCLE))
    expect(cellContentParser.parse('#NAME?').cellValue).toEqual(new CellContent.Error(ErrorType.NAME))
    expect(cellContentParser.parse('#REF!').cellValue).toEqual(new CellContent.Error(ErrorType.REF))
  })

  it('errors are case insensitive', () => {
    expect(cellContentParser.parse('#dIv/0!').cellValue).toEqual(new CellContent.Error(ErrorType.DIV_BY_ZERO))
  })

  it('error-like literal is string', () => {
    expect(cellContentParser.parse('#FOO!').cellValue).toEqual(new CellContent.String('#FOO!'))
  })

  it('date parsing', () => {
    expect(cellContentParser.parse('02-02-2020').cellValue).toEqual(new CellContent.Number(new DateNumber(43863, 'DD/MM/YYYY')))
    expect(cellContentParser.parse('  02-02-2020').cellValue).toEqual(new CellContent.Number(new DateNumber(43863, 'DD/MM/YYYY')))
  })

  it('JS Date parsing', () => {
    expect(cellContentParser.parse(new Date(1995, 11, 17)).cellValue).toEqual(new CellContent.Number(new DateNumber(35050, 'Date()')))
    expect(cellContentParser.parse(new Date(1995, 11, 17, 12, 0, 0)).cellValue).toEqual(new CellContent.Number(new DateTimeNumber(35050.5, 'Date()')))
    expect(cellContentParser.parse(new Date(1899, 11, 30, 6, 0, 0)).cellValue).toEqual(new CellContent.Number(new TimeNumber(0.25, 'Date()')))
    expect(cellContentParser.parse(new Date(1899, 11, 29)).cellValue).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.DateBounds))
  })

  it('starts with \'', () => {
    expect(cellContentParser.parse('\'123').cellValue).toEqual(new CellContent.String('123'))
    expect(cellContentParser.parse('\'=1+1').cellValue).toEqual(new CellContent.String('=1+1'))
    expect(cellContentParser.parse('\'\'1').cellValue).toEqual(new CellContent.String('\'1'))
    expect(cellContentParser.parse('\' 1').cellValue).toEqual(new CellContent.String(' 1'))
    expect(cellContentParser.parse(' \'1').cellValue).toEqual(new CellContent.String(' \'1'))
    expect(cellContentParser.parse('\'02-02-2020').cellValue).toEqual(new CellContent.String('02-02-2020'))
  })

  it('currency parsing', () => {
    expect(cellContentParser.parse('1$').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse('$1').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse('-1.1e1$').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(-11, '$')))
    expect(cellContentParser.parse('$-1.1e1').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(-11, '$')))
    expect(cellContentParser.parse(' 1$ ').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse(' $1 ').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse('1 $').cellValue).toEqual(new CellContent.String('1 $'))
    expect(cellContentParser.parse('$ 1').cellValue).toEqual(new CellContent.String('$ 1'))
  })

  it('other currency parsing', () => {
    expect(cellContentParser.parse('1PLN').cellValue).toEqual(new CellContent.String('1PLN'))
    const configPLN = new Config({currencySymbol: [{ cellValue: 'PLN' }]})
    const cellContentParserPLN = new CellContentParser(configPLN, new DateTimeHelper(configPLN), new NumberLiteralHelper(configPLN))
    expect(cellContentParserPLN.parse('1PLN').cellValue).toEqual(new CellContent.Number(new CurrencyNumber(1, 'PLN')))
  })

  it('percentage parsing', () => {
    expect(cellContentParser.parse('100%').cellValue).toEqual(new CellContent.Number(new PercentNumber(1)))
    expect(cellContentParser.parse('-1.1e3%').cellValue).toEqual(new CellContent.Number(new PercentNumber(-11)))
    expect(cellContentParser.parse(' 100% ').cellValue).toEqual(new CellContent.Number(new PercentNumber(1)))
    expect(cellContentParser.parse('100 %').cellValue).toEqual(new CellContent.String('100 %'))
  })
})
