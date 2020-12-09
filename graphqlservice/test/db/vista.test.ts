import { db, selectVistaEnhancers } from "../../src/postgres";
import { GenomicRange } from "../../src/postgres/types";

const COORDINATES: GenomicRange = { chromosome: "chr1", start: 3327997, end: 3332165 };

describe("VISTA enhancer queries for hg38", () => {
    
    test("should select two VISTA enhancers for a coordinate range", async () => {
        console.log("test");
        const results = await selectVistaEnhancers({ assembly: "hg38", coordinates: COORDINATES }, db);
        console.log(results);
        expect(results.length).toBe(2);
        expect(results).toEqual([{
            accession: "hs2274",
            activity: false,
            ccre: "EH38E1312571",
            chromosome: "chr1",
            endpos: 3332165,
            overlap: 347,
            startpos: 3327997,
            tissues: []
        }, {
            accession: "hs2274",
            activity: false,
            ccre: "EH38E1312575",
            chromosome: "chr1",
            endpos: 3332165,
            overlap: 255,
            startpos: 3327997,
            tissues: []
        }]);
    });

    test("should select three VISTA enhancers for heart", async () => {
        const results = await selectVistaEnhancers({ assembly: "hg38", tissues: [ "heart" ] }, db);
        expect(results.length).toBe(3);
    });

    test("should select VISTA enhancers by cCRE", async () => {
        let results = await selectVistaEnhancers({ assembly: "hg38", cCRE: [ "EH38E1312575" ] }, db);
        expect(results.length).toBe(1);
        results = await selectVistaEnhancers({ assembly: "hg38", cCRE: [ "EH38E1312575", "EH38E1312571" ] }, db);
        expect(results.length).toBe(2);
    });

    test("should select VISTA enhancers by accession", async () => {
        let results = await selectVistaEnhancers({ assembly: "hg38", accession: [ "hs2274" ] }, db);
        expect(results.length).toBe(2);
        results = await selectVistaEnhancers({ assembly: "hg38", accession: [ "hs2274", "hs1912" ] }, db);
        expect(results.length).toBe(5);
    });

    test("should select two VISTA enhancers with an overlap of at least 345 basepairs", async () => {
        const results = await selectVistaEnhancers({ assembly: "hg38", minimumOverlap: 345 }, db);
        expect(results.length).toBe(2);
    });

});
