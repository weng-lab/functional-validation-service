import { IDatabase } from 'pg-promise';
import { VistaParameters, VistaResult } from '../types';
import { coordinateParameters } from '../utilities';
import { ParameterMap, whereClause, conditionClauses, fieldMatchesAny } from 'queryz';

const VISTA_PARAMETERS: ParameterMap<VistaParameters> = new Map([
    [ "cCRE", fieldMatchesAny("cCRE") ],
    [ "accession", fieldMatchesAny("accession") ],
    [ "coordinates", coordinateParameters("startpos", "endpos") ],
    [ "tissues", tableName => `${tableName}.tissues @> \${${tableName}.tissues}` ],
    [ "minimumOverlap", tableName => `${tableName}.overlap >= \${${tableName}.minimumOverlap}` ]
]);

/**
 * Selects eQTL records from the database.
 * @param assembly genomic assembly for which to select eQTLs.
 * @param parameters parameters used to filter search results.
 * @param db connection to the database.
 */
export async function selectVistaEnhancers(parameters: VistaParameters, db: IDatabase<any>): Promise<VistaResult[]> {
    const tableName = `${parameters.assembly}_vista_enhancers`;
    return db.any(`
        SELECT ccre, overlap, chromosome, startpos, endpos, accession, activity, tissues
          FROM \${tableName~} AS vista_table
         WHERE ${whereClause(conditionClauses(parameters, VISTA_PARAMETERS, "vista_table"))}
        ORDER BY accession ASC
    `, { vista_table: parameters, tableName });
};
