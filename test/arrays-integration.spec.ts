import {HyperFormula} from '../src'
import {adr} from './testUtils'

describe('integration test', () => {
  it('should work', () => {
    const [engine] = HyperFormula.buildFromSheets({
      'Output': { cells: [[{ cellValue: '=INDEX(LookupRange,MATCH(1,(Lookup!A1:A8<=Inputs!A1)*(Lookup!B1:B8>=Inputs!A1)*(Lookup!C1:C8=Inputs!B1), 0), 4)' }]]},
      'Inputs': { cells: [[{ cellValue: 23 }, { cellValue: 'B' }]]},
      'Lookup': { cells:  [
        [{ cellValue: 11 }, { cellValue: 15 }, { cellValue: 'A' }, { cellValue: 66}],
        [{ cellValue: 11 }, { cellValue: 15 }, { cellValue: 'B' }, { cellValue: 77}],
        [{ cellValue: 16 }, { cellValue: 20 }, { cellValue: 'A' }, { cellValue: 88}],
        [{ cellValue: 16 }, { cellValue: 20 }, { cellValue: 'B' }, { cellValue: 99}],
        [{ cellValue: 21 }, { cellValue: 25 }, { cellValue: 'A' }, { cellValue: 110}],
        [{ cellValue: 21 }, { cellValue: 25 }, { cellValue: 'B' }, { cellValue: 121}],
        [{ cellValue: 26 }, { cellValue: 30 }, { cellValue: 'A' }, { cellValue: 132}],
        [{ cellValue: 26 }, { cellValue: 30 }, { cellValue: 'B' }, { cellValue: 143}],
      ]}
    }, {useArrayArithmetic: true}) //flag that enables ArrayFormula() everywhere

    engine.addNamedExpression('LookupRange', '=Lookup!$A$1:Lookup!$D$8')

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(121)

    engine.setCellContents(adr('B1', engine.getSheetId('Inputs')), { cellValue: 'A' })

    expect(engine.getCellValue(adr('A1')).cellValue).toEqual(110)
  })
})
