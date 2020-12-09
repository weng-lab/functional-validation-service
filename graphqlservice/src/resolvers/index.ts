import { GraphQLResolverMap } from "apollo-graphql";
import { vistaResolvers, vistaQuery } from "./vista";

export const resolvers: GraphQLResolverMap = {
    Query: {
        vistaQuery
    },
    ...vistaResolvers,
};
