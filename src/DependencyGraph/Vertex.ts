/**
 * @license
 * Copyright (c) 2021 Handsoncode. All rights reserved.
 */

import { CellMetadata } from '../interpreter/InterpreterValue'
import {EmptyCellVertex, ParsingErrorVertex, RangeVertex, ValueCellVertex} from './'
import {FormulaVertex} from './FormulaCellVertex'

/**
 * Represents vertex which keeps values of one or more cells
 */
export type CellVertex = FormulaVertex | ValueCellVertex | EmptyCellVertex | ParsingErrorVertex

export type CellVertexMetadata = {
    vertex?: CellVertex,
    metadata?: CellMetadata,
}

/**
 * Represents any vertex
 */
export type Vertex = CellVertex | RangeVertex
