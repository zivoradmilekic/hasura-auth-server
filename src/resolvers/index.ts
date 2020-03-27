import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';

import { doQuery } from '../helpers';
import { MeQuery, LoginQuery, SignupMutation } from '../queries';

export const resolvers = {
  Query: {
    me: combineResolvers(
      isAuthenticated,
      async (parent: any, args: any, { me: { id } }: any) => {
        console.log('me', parent, args, id);

        return await doQuery(MeQuery, { id });
      }
    ),
    login: async (parent: any, { email, password }: any, { createToken }: any) => {
      console.log('login', parent, email, password);

      const user = await doQuery(LoginQuery, { email, password });

      return {
        "token": createToken(user)
      };
    },
  },
  Mutation: {
    signup: async (parent: any, { name, username, email, password }: any, { createToken }: any) => {
      console.log('signup', parent, name, username, email, password);

      const user = await doQuery(SignupMutation, { name, username, email, password });

      return {
        "token": createToken(user)
      };
    },
  }
};
