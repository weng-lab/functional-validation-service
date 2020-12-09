import { gql } from "apollo-server-core";
import { buildFederatedSchema } from "@apollo/federation";
import { resolvers } from "./resolvers";

export const typeDefs = gql`

    type GenomicRange {
        chromosome: String!
        start: Int!
        end: Int!
    }

    input GenomicRangeInput {
        chromosome: String!
        start: Int!
        end: Int!
    }

    type VistaEnhancer {
        cCRE: String!
        accession: String!
        overlap: Int!
        coordinates: GenomicRange!
        tissues: [String!]!
        active: Boolean!
    }

    type Query {

        vistaQuery(
            assembly: String!
            cCRE: [String!]
            accession: [String!]
            tissues: [String!]
            minimumOverlap: Int
            coordinates: GenomicRangeInput
        ): [VistaEnhancer!]!

    }

`;
export const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
