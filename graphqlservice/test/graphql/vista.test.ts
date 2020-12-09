import request, { Response } from "supertest";
import app from "../../src/app";
import { GenomicRange } from "../../src/postgres/types";

jest.setTimeout(300000);

const COORDINATES: GenomicRange = { chromosome: "chr1", start: 3327997, end: 3332165 };

const query = `
query vista(
  $assembly: String!
  $cCRE: [String!]
  $accession: [String!]
  $minimumOverlap: Int
  $tissues: [String!]
  $coordinates: GenomicRangeInput
) {
  vistaQuery(
    assembly: $assembly
    cCRE: $cCRE
    accession: $accession
    minimumOverlap: $minimumOverlap
    tissues: $tissues
    coordinates: $coordinates
  ) {
    cCRE
    accession
    overlap
    tissues
    active
    coordinates {
      chromosome
      start
      end
    }
  }
}
`;

describe("VISTA enhancer queries", () => {

    test("should return VISTA enhancers for hg38", async () => {
        const variables = { assembly: "hg38" };
        const response: Response = await request(app)
            .post("/graphql")
            .send({ query, variables });
        expect(response.status).toBe(200);
        expect(response.body.data.vistaQuery.length).toEqual(5);
    });

    test("should return VISTA enhancers for hg38 for a set of coordinates", async () => {
      const variables = { assembly: "hg38", coordinates: COORDINATES };
      const response: Response = await request(app)
            .post("/graphql")
            .send({ query, variables });
      expect(response.status).toBe(200);
      expect(response.body.data.vistaQuery.length).toEqual(2);
      expect(response.body.data.vistaQuery).toEqual([{
        accession: "hs2274",
        active: false,
        cCRE: "EH38E1312571",
        coordinates: {
          chromosome: "chr1",
          end: 3332165,
          start: 3327997
        },
        overlap: 347,
        tissues: []
      }, {
        accession: "hs2274",
        active: false,
        cCRE: "EH38E1312575",
        coordinates: {
          chromosome: "chr1",
          start: 3327997,
          end: 3332165
        },
        overlap: 255,
        tissues: []
      }]);
  });

  test("should return VISTA enhancers for hg38 by cCRE", async () => {
    let variables = { assembly: "hg38", cCRE: [ "EH38E1312575" ] };
    let response: Response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(1);
    variables = { assembly: "hg38", cCRE: [ "EH38E1312575", "EH38E1312571" ] };
    response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(2);
  });

  test("should return VISTA enhancers for hg38 by cCRE", async () => {
    let variables = { assembly: "hg38", accession: [ "hs2274" ] };
    let response: Response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(2);
    variables = { assembly: "hg38", accession: [ "hs2274", "hs1912" ] };
    response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(5);
  });

  test("should return VISTA enhancers for hg38 by cCRE", async () => {
    const variables = { assembly: "hg38", minimumOverlap: 345 };
    const response: Response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(2);
  });

  test("should return VISTA enhancers for hg38 by cCRE", async () => {
    const variables = { assembly: "hg38", tissues: [ "heart" ] };
    const response: Response = await request(app)
        .post("/graphql")
        .send({ query, variables });
    expect(response.status).toBe(200);
    expect(response.body.data.vistaQuery.length).toEqual(3);
  });

});
