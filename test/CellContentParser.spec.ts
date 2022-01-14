import {ErrorType} from '../src/Cell'
import {CellContent, CellContentParser} from '../src/CellContentParser'
import {Config} from '../src/Config'
import {DateTimeHelper} from '../src/DateTimeHelper'
import {ErrorMessage} from '../src/error-message'
import {
  CurrencyNumber,
  DateNumber,
  DateTimeNumber,
  PercentNumber,
  TimeNumber,
} from '../src/interpreter/InterpreterValue'
import {NumberLiteralHelper} from '../src/NumberLiteralHelper'

describe('CellContentParser', () => {
  const config = new Config()
  const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

  it('a formula', () => {
    expect(cellContentParser.parse({ cellValue: '=FOO()' })).toEqual(new CellContent.Formula('=FOO()'))
  })

  it('null is empty value', () => {
    expect(cellContentParser.parse({ cellValue: null })).toEqual(new CellContent.Empty())
  })

  it('undefined is empty value', () => {
    expect(cellContentParser.parse({ cellValue: undefined })).toEqual(new CellContent.Empty())
  })

  it('numbers', () => {
    expect(cellContentParser.parse({ cellValue: '42' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: '+42' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: ' 42' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: '42 ' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: '42.13' })).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse({ cellValue: '-42.13' })).toEqual(new CellContent.Number(-42.13))
    expect(cellContentParser.parse({ cellValue: '+42.13' })).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse({ cellValue: '.13' })).toEqual(new CellContent.Number(0.13))
  })

  it('boolean', () => {
    expect(cellContentParser.parse({ cellValue: 'true' })).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse({ cellValue: 'false' })).toEqual(new CellContent.Boolean(false))
    expect(cellContentParser.parse({ cellValue: 'TRUE' })).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse({ cellValue: 'FALSE' })).toEqual(new CellContent.Boolean(false))
    expect(cellContentParser.parse({ cellValue: 'TrUe' })).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse({ cellValue: 'faLSE' })).toEqual(new CellContent.Boolean(false))
  })

  it('numbers with different decimal separators', () => {
    const config = new Config({decimalSeparator: ',', functionArgSeparator: ';'})
    const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

    expect(cellContentParser.parse({ cellValue: '42' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: '42,13' })).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse({ cellValue: '-42,13' })).toEqual(new CellContent.Number(-42.13))
    expect(cellContentParser.parse({ cellValue: '+42,13' })).toEqual(new CellContent.Number(42.13))
    expect(cellContentParser.parse({ cellValue: ',13' })).toEqual(new CellContent.Number(0.13))
    expect(cellContentParser.parse({ cellValue: '42.13' })).toEqual(new CellContent.String('42.13'))
    expect(cellContentParser.parse({ cellValue: '12,34,56' })).toEqual(new CellContent.String('12,34,56'))
  })

  it('numbers with thousand separators', () => {
    const config = new Config({thousandSeparator: ' ', functionArgSeparator: ';'})
    const cellContentParser = new CellContentParser(config, new DateTimeHelper(config), new NumberLiteralHelper(config))

    expect(cellContentParser.parse({ cellValue: '42' })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: '1234567' })).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse({ cellValue: '1 234 567' })).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse({ cellValue: '-1 234 567' })).toEqual(new CellContent.Number(-1234567))
    expect(cellContentParser.parse({ cellValue: '1234 567' })).toEqual(new CellContent.Number(1234567))
    expect(cellContentParser.parse({ cellValue: '12 3456 789' })).toEqual(new CellContent.Number(123456789))
    expect(cellContentParser.parse({ cellValue: '1 234 567.12' })).toEqual(new CellContent.Number(1234567.12))
    expect(cellContentParser.parse({ cellValue: '12 34 56 7' })).toEqual(new CellContent.String('12 34 56 7'))
    expect(cellContentParser.parse({ cellValue: '1 234.12.12' })).toEqual(new CellContent.String('1 234.12.12'))
  })

  it('non-string', () => {
    expect(cellContentParser.parse({ cellValue: 42 })).toEqual(new CellContent.Number(42))
    expect(cellContentParser.parse({ cellValue: true })).toEqual(new CellContent.Boolean(true))
    expect(cellContentParser.parse({ cellValue: null })).toEqual(new CellContent.Empty())
    expect(cellContentParser.parse({ cellValue: undefined })).toEqual(new CellContent.Empty())
    expect(cellContentParser.parse({ cellValue: -0 })).toEqual(new CellContent.Number(0))
    expect(cellContentParser.parse({ cellValue: Infinity })).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(cellContentParser.parse({ cellValue: -Infinity })).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
    expect(cellContentParser.parse({ cellValue: NaN })).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge))
  })

  it('string', () => {
    expect(cellContentParser.parse({ cellValue: 'f42' })).toEqual(new CellContent.String('f42'))
    expect(cellContentParser.parse({ cellValue: '42f' })).toEqual(new CellContent.String('42f'))
    expect(cellContentParser.parse({ cellValue: ' =FOO()' })).toEqual(new CellContent.String(' =FOO()'))
    expect(cellContentParser.parse({ cellValue: ' ' })).toEqual(new CellContent.String(' '))
    expect(cellContentParser.parse({ cellValue: '' })).toEqual(new CellContent.String(''))
  })

  it('errors', () => {
    expect(cellContentParser.parse({ cellValue: '#DIV/0!' })).toEqual(new CellContent.Error(ErrorType.DIV_BY_ZERO))
    expect(cellContentParser.parse({ cellValue: '#NUM!' })).toEqual(new CellContent.Error(ErrorType.NUM))
    expect(cellContentParser.parse({ cellValue: '#N/A' })).toEqual(new CellContent.Error(ErrorType.NA))
    expect(cellContentParser.parse({ cellValue: '#VALUE!' })).toEqual(new CellContent.Error(ErrorType.VALUE))
    expect(cellContentParser.parse({ cellValue: '#CYCLE!' })).toEqual(new CellContent.Error(ErrorType.CYCLE))
    expect(cellContentParser.parse({ cellValue: '#NAME?' })).toEqual(new CellContent.Error(ErrorType.NAME))
    expect(cellContentParser.parse({ cellValue: '#REF!' })).toEqual(new CellContent.Error(ErrorType.REF))
  })

  it('errors are case insensitive', () => {
    expect(cellContentParser.parse({ cellValue: '#dIv/0!' })).toEqual(new CellContent.Error(ErrorType.DIV_BY_ZERO))
  })

  it('error-like literal is string', () => {
    expect(cellContentParser.parse({ cellValue: '#FOO!' })).toEqual(new CellContent.String('#FOO!'))
  })

  it('date parsing', () => {
    expect(cellContentParser.parse({ cellValue: '02-02-2020' })).toEqual(new CellContent.Number(new DateNumber(43863, 'DD/MM/YYYY')))
    expect(cellContentParser.parse({ cellValue: '  02-02-2020' })).toEqual(new CellContent.Number(new DateNumber(43863, 'DD/MM/YYYY')))
  })

  it('JS Date parsing', () => {
    expect(cellContentParser.parse({ cellValue: new Date(1995, 11, 17) })).toEqual(new CellContent.Number(new DateNumber(35050, 'Date()')))
    expect(cellContentParser.parse({ cellValue: new Date(1995, 11, 17, 12, 0, 0) })).toEqual(new CellContent.Number(new DateTimeNumber(35050.5, 'Date()')))
    expect(cellContentParser.parse({ cellValue: new Date(1899, 11, 30, 6, 0, 0) })).toEqual(new CellContent.Number(new TimeNumber(0.25, 'Date()')))
    expect(cellContentParser.parse({ cellValue: new Date(1899, 11, 29) })).toEqual(new CellContent.Error(ErrorType.NUM, ErrorMessage.DateBounds))
  })

  it('starts with \'', () => {
    expect(cellContentParser.parse({ cellValue: '\'123' })).toEqual(new CellContent.String('123'))
    expect(cellContentParser.parse({ cellValue: '\'=1+1' })).toEqual(new CellContent.String('=1+1'))
    expect(cellContentParser.parse({ cellValue: '\'\'1' })).toEqual(new CellContent.String('\'1'))
    expect(cellContentParser.parse({ cellValue: '\' 1' })).toEqual(new CellContent.String(' 1'))
    expect(cellContentParser.parse({ cellValue: ' \'1' })).toEqual(new CellContent.String(' \'1'))
    expect(cellContentParser.parse({ cellValue: '\'02-02-2020' })).toEqual(new CellContent.String('02-02-2020'))
  })

  it('currency parsing', () => {
    expect(cellContentParser.parse({ cellValue: '1$' })).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse({ cellValue: '$1' })).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse({ cellValue: '-1.1e1$' })).toEqual(new CellContent.Number(new CurrencyNumber(-11, '$')))
    expect(cellContentParser.parse({ cellValue: '$-1.1e1' })).toEqual(new CellContent.Number(new CurrencyNumber(-11, '$')))
    expect(cellContentParser.parse({ cellValue: ' 1$ ' })).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse({ cellValue: ' $1 ' })).toEqual(new CellContent.Number(new CurrencyNumber(1, '$')))
    expect(cellContentParser.parse({ cellValue: '1 $' })).toEqual(new CellContent.String('1 $'))
    expect(cellContentParser.parse({ cellValue: '$ 1' })).toEqual(new CellContent.String('$ 1'))
  })

  it('other currency parsing', () => {
    expect(cellContentParser.parse({ cellValue: '1PLN' })).toEqual(new CellContent.String('1PLN'))
    const configPLN = new Config({currencySymbol: ['PLN']})
    const cellContentParserPLN = new CellContentParser(configPLN, new DateTimeHelper(configPLN), new NumberLiteralHelper(configPLN))
    expect(cellContentParserPLN.parse({ cellValue: '1PLN' })).toEqual(new CellContent.Number(new CurrencyNumber(1, 'PLN')))
  })

  it('percentage parsing', () => {
    expect(cellContentParser.parse({ cellValue: '100%' })).toEqual(new CellContent.Number(new PercentNumber(1)))
    expect(cellContentParser.parse({ cellValue: '-1.1e3%' })).toEqual(new CellContent.Number(new PercentNumber(-11)))
    expect(cellContentParser.parse({ cellValue: ' 100% ' })).toEqual(new CellContent.Number(new PercentNumber(1)))
    expect(cellContentParser.parse({ cellValue: '100 %' })).toEqual(new CellContent.String('100 %'))
  })
})
