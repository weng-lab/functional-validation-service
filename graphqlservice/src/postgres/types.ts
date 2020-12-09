/**
 * Represents a genomic coordinate.
 * @member chromosome the chromosome on which the region resides.
 * @member start the starting base pair of the region.
 * @member end the ending base pair of the region.
 */
export interface GenomicRange {
    chromosome: string;
    start: number;
    end: number;
};

/**
 * Generic object representing parameters for filtering results.
 * @member limit maximum number of rows to return.
 * @member offset index of the first row to return from the results set.
 */
export interface Parameters {
    limit?: number;
    offset?: number;
    [key: string]: any;
};

/**
 * Parameters for filtering VISTA enhancer results.
 * @member cCRE select VISTA enhancers intersecting these cCREs.
 * @member coordinates select eQTLs falling within the given genomic range.
 * @member accession select VISTA enhancers with these accessions.
 * @member tissues if set, selects VISTA enhancers active in these tissues.
 * @member minimumOverlap selects VISTA enhancers which overlap a cCRE by at least this many basepairs.
 */
export interface VistaParameters extends Parameters {
    assembly: string;
    cCRE?: string[];
    coordinates?: GenomicRange;
    accession?: string[];
    tissues?: string[];
    minimumOverlap?: number;
};

export type VistaResult = {
    ccre: string;
    overlap: number;
    chromosome: string;
    startpos: number;
    endpos: number;
    accession: string;
    activity: boolean;
    tissues: string[];
};
