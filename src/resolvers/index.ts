import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';

import { doQuery, generatePasswordHash } from '../helpers';
import { MeQuery, LoginQuery, SignupMutation } from '../queries';
import { UserInputError } from 'apollo-server';

export const resolvers = {
  Query: {
    me: combineResolvers(
      isAuthenticated,
      async (parent: any, args: any, { me: { id } }: any) => {
        console.log('me', id);
        try {
          const { users } =  await doQuery(MeQuery, { id });
          return users[0];
        } catch (error) {
          throw error;
        }
      }
    )
  },
  Mutation: {
    login: async (parent: any, { email, password }: any, { createToken }: any) => {
      console.log('login', email, password, generatePasswordHash(password));

      try {
        const { users } = await doQuery(
          LoginQuery,
          {
            email,
            password: generatePasswordHash(password)
          }
        );

        return {
          "token": createToken(users[0], new UserInputError('No user found with this login credentials.'))
        };
      } catch (error) {
        throw error;
      }
    },
    signup: async (parent: any, { name, username, email, password }: any, { createToken }: any) => {
      console.log('signup', parent, name, username, email, password);

      try {
        const { insert_users } = await doQuery(
          SignupMutation,
          {
            name,
            username,
            email,
            password: await generatePasswordHash(password)
          }
        );

        return {
          "token": createToken(insert_users.returning[0], new UserInputError('Not signup. Try again.'))
        };
      } catch (error) {
        throw error;
      }
    }
  }
};
