import { gql } from 'apollo-server';

export default gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Token {
    token: String!
  }
  # This "User" type defines the queryable fields for every book in our data source.
  type User {
    id: String
    name: String
    username: String
    email: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    me: User
  }

  type Mutation {
    login(
      email: String!
      password: String!
    ): Token
    signup(
      name: String!
      username: String!
      email: String!
      password: String!
    ): Token
  }
`;
