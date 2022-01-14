import {HyperFormula} from '../../src'
import {ErrorType} from '../../src/Cell'
import {ErrorMessage} from '../../src/error-message'
import {adr, detailedError} from '../testUtils'

describe('Function DATEDIF', () => {
  it('should not work for wrong number of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF(1, 2, 3, 4)' }],
      [{ cellValue: '=DATEDIF(1, 2)' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NA, ErrorMessage.WrongArgNumber))
  })

  it('should not work for wrong type of arguments', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("foo", 1, "Y")' }],
      [{ cellValue: '=DATEDIF(2, "bar", "Y")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.VALUE, ErrorMessage.NumberCoercion))
  })

  it('numerical errors', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF(1, 2, "abcd")' }],
      [{ cellValue: '=DATEDIF(2, 1, "Y")' }],
      [{ cellValue: '=DATEDIF(1.9, 1.8, "Y")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.BadMode))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.StartEndDate))
    expect(engine.getCellValue(adr('A3')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.StartEndDate))
  })

  it('"D" mode', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("30/12/2018", "30/12/2018", "D")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "01/03/2019", "D")' }],
      [{ cellValue: '=DATEDIF("28/02/2020", "01/03/2020", "D")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })

  it('ignores time', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("22:00", "36:00", "D")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "01/03/2019 1:00am", "D")' }],
      [{ cellValue: '=DATEDIF("28/02/2020 2:00pm", "01/03/2020", "D")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
  })

  it('"M" mode', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("30/12/2018", "30/12/2019", "M")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "29/03/2019", "M")' }],
      [{ cellValue: '=DATEDIF("29/02/2020", "28/03/2020", "M")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(12)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
  })

  it('"YM" mode', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("30/12/2018", "30/12/2019", "YM")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "29/03/2019", "YM")' }],
      [{ cellValue: '=DATEDIF("29/02/2020", "28/03/2020", "YM")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
  })

  it('"Y" mode', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("01/03/2019", "29/02/2020", "Y")' }],
      [{ cellValue: '=DATEDIF("01/03/2019", "28/02/2020", "Y")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "29/02/2020", "Y")' }],
      [{ cellValue: '=DATEDIF("28/02/2019", "28/02/2020", "Y")' }],
      [{ cellValue: '=DATEDIF("29/02/2020", "28/02/2021", "Y")' }],
      [{ cellValue: '=DATEDIF("29/02/2020", "01/03/2021", "Y")' }],
      [{ cellValue: '=DATEDIF("28/02/2020", "28/02/2021", "Y")' }],
      [{ cellValue: '=DATEDIF("28/02/2020", "01/03/2021", "Y")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A8')).cellValue).toEqual(1)
  })

  it('"MD" mode #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2019", "29/02/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/03/2019", "28/02/2020", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
  })

  it('"MD" mode #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2016", "01/05/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/05/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/05/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/01/2016", "01/05/2020", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
  })

  it('"MD" mode #3', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2016", "01/03/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/03/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/03/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/01/2016", "01/03/2020", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
  })

  it('"MD" mode #4', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2016", "01/03/2021", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/03/2021", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/03/2021", "MD")' }],
      [{ cellValue: '=DATEDIF("28/01/2016", "01/03/2021", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
  })

  it('"MD" mode #5', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2016", "01/02/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/02/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/02/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/01/2016", "01/02/2020", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
  })

  it('"MD" mode #6', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/03/2016", "01/01/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/01/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/01/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("28/01/2016", "01/01/2020", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(4)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(4)
  })

  it('"MD" mode negative result', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("31/01/2020", "01/03/2020", "MD")' }],
      [{ cellValue: '=DATEDIF("31/01/2021", "01/03/2021", "MD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(-1)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(-2)
  })

  it('"YD" mode #1', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("27/02/2016", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2016", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(2)
  })

  it('"YD" mode #2', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/02/2016", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2016", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(1)
  })

  it('"YD" mode #3', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("29/02/2016", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("29/02/2016", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  it('"YD" mode #4', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("01/03/2016", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2016", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(363)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(363)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  it('"YD" mode #5', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("27/02/2015", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("27/02/2015", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(3)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(2)
  })

  it('"YD" mode #6', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("28/02/2015", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("28/02/2015", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(1)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(2)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(1)
  })

  it('"YD" mode #7', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF("01/03/2015", "27/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "28/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "29/02/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "01/03/2020", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "27/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "28/02/2021", "YD")' }],
      [{ cellValue: '=DATEDIF("01/03/2015", "01/03/2021", "YD")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(363)
    expect(engine.getCellValue(adr('A2')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A3')).cellValue).toEqual(365)
    expect(engine.getCellValue(adr('A4')).cellValue).toEqual(0)
    expect(engine.getCellValue(adr('A5')).cellValue).toEqual(363)
    expect(engine.getCellValue(adr('A6')).cellValue).toEqual(364)
    expect(engine.getCellValue(adr('A7')).cellValue).toEqual(0)
  })

  //inconsistency with product 1
  it('fails for negative values', () => {
    const [engine] = HyperFormula.buildFromArray({ cells: [
      [{ cellValue: '=DATEDIF(-1, 0, "Y")' }],
      [{ cellValue: '=DATEDIF(0, -1, "M")' }],
    ]})

    expect(engine.getCellValue(adr('A1')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
    expect(engine.getCellValue(adr('A2')).cellValue).toEqualError(detailedError(ErrorType.NUM, ErrorMessage.ValueSmall))
  })
})
