import { selectVistaEnhancers, db } from '../postgres';
import { GenomicRange, VistaParameters, VistaResult } from '../postgres/types';

export async function vistaQuery(_: any, parameters: VistaParameters | any): Promise<VistaResult[]> {
    return selectVistaEnhancers(parameters, db);
}

function resolveCoordinates(obj: VistaResult): GenomicRange {
    return {
	    chromosome: obj.chromosome,
	    start: obj.startpos,
	    end: obj.endpos
    };
}

export const vistaResolvers = {
    VistaEnhancer: {
        coordinates: resolveCoordinates,
        cCRE: (obj: VistaResult) => obj.ccre,
        active: (obj: VistaResult) => obj.activity
    }
};
