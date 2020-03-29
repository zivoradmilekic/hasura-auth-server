import jwt from "jsonwebtoken";
import { query } from "graphqurl";
import { AuthenticationError, ForbiddenError, UserInputError, ApolloError } from "apollo-server";
import { DocumentNode } from "graphql";

export const getMe = async (req: any) => {
  const authorization = req.headers['authorization'];

  if (authorization) {
    const [Bearer, token] = authorization.split(' ');

    if (token) {
      try {
        return await jwt.verify(token, process.env.HASURA_SECRET);
      } catch (e) {
        throw new AuthenticationError(
          'Your session expired. Sign in again.',
        );
      }
    }
  }
};

export const createToken = async (data: any, error: Error) => {
  try {
    return await jwt.sign(data, process.env.HASURA_SECRET);
  } catch (e) {
    throw error;
  }
}

export const doQuery = async (GQLQuery: DocumentNode, GQLVariables: any) => {
  try {
    const { data } = await query(
      {
        query: GQLQuery,
        variables: GQLVariables,
        endpoint: process.env.HASURA_ENDPOINT,
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_SECRET,
        }
      }
    );

    return data;
  } catch (error) {
    throw error;
  }
};
