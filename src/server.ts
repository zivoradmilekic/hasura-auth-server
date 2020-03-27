import 'dotenv/config';
import cors from "cors";
import { ApolloServer } from "apollo-server";

import typeDefs from "./schema";
import { resolvers } from "./resolvers";
import { getMe, createToken } from "./helpers";

const server = new ApolloServer({
  introspection: true,
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    return {
      me: await getMe(req),
      createToken
    }
  }
});

// The `listen` method launches a web server.
server.listen(process.env.PORT).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
