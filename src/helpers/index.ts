import jwt from "jsonwebtoken";
import md5 from "md5";
import { query } from "graphqurl";
import { DocumentNode } from "graphql";

const getGravatar = (email: string) => {
  return `https://www.gravatar.com/avatar/${md5(email || '')}?d=mp`;
}

export const generateAccessToken = ({id, name, username, email}: any, secret: jwt.Secret) => {
  const tokenContents = {
    sub: id,
    name,
    username,
    email,
    gravatar: getGravatar(email),
    iat: Date.now() / 1000,
    // iss: 'https://myapp.com/',
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": id,
      "x-hasura-default-role": "user",
      "x-hasura-role": "user"
    },
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }

  return jwt.sign(tokenContents, secret);
}

export const getTokenContents = async (authorization: string, secret: jwt.Secret) => {
  if (authorization) {
    const [Bearer, token] = authorization.split(' ');

    if (token) {
      try {
        const data: any = jwt.verify(token, secret);
        return data;
      } catch (e) {
        throw new Error(
          'Your session expired. Sign in again.',
        );
      }
    }
  }
};

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
