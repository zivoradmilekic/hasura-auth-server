import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from 'graphqurl';
import bodyParser from 'body-parser';

import { generateAccessToken, getTokenContents } from "./helpers";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", function(request, response) {
  return response.send({
     message: 'Done!'
  });
});

app.post("/on_insert_team", function(request, response) {
  const { hasura_endpoint, hasura_admin_secret } = request.headers;
  const { id: team_id, owner_id: id } = request.body.event.data.new;

  query(
    {
      query: `
        mutation UpdateUsersMutation($id: uuid!, $team_id: uuid!) {
          update_users(where: {id: {_eq: $id}}, _set: {team_id: $team_id}) {
            affected_rows
          }
        }
      `,
      endpoint: hasura_endpoint,
      headers: {
        'x-hasura-admin-secret': hasura_admin_secret,
      },
      variables: {
        id,
        team_id
      }
    }
  ).then(() => response.send({
     message: 'Done!'
  }))
   .catch(() => response.status(400).send({
     message: 'This is an error!'
  }));

});

app.post("/signup", async function(request, response) {
  const { hasura_endpoint, hasura_admin_secret }: any = request.headers;
  const { name, username, email, password}: any = request.body.input;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  query(
    {
      query: `
        mutation InsertUserMutation ($name: String!, $username: String!, $email: String!, $password: String!) {
          insert_users_one(object: {name: $name, username: $username, email: $email, password: $password}) {
            id
            name
            username
            email
            password
          }
        }
      `,
      endpoint: hasura_endpoint,
      headers: {
        'x-hasura-admin-secret': hasura_admin_secret,
      },
      variables: {
        name,
        username,
        email,
        password: hashedPassword
      }
    }
  ).then((res: any) => {
    // success
    const user = res.data.insert_users_one;

    if (!user) {
      return response.status(400).send({
         message: 'This is an error! 2'
      });
    }

    console.log("res", JSON.stringify(user));
    return response.json({
      accessToken: generateAccessToken(user, hasura_admin_secret),
      userId: user.id
    })
  })
  .catch(() => {
    return response.status(400).send({
       message: 'This is an error!'
    })
  });
});

app.post("/login", function(request, response) {
  const {hasura_endpoint, hasura_admin_secret}: any = request.headers;
  const { email, password }: any = request.body.input;

  query(
    {
      query: `
        query ($email: String!) {
          users(where: {email: {_eq: $email}}) {
            id
            name
            username
            email
            password
          }
        }
      `,
      endpoint: hasura_endpoint,
      headers: {
        'x-hasura-admin-secret': hasura_admin_secret,
      },
      variables: {
        email
      }
    }
  ).then(async (res: any) => {
    // success
    const [user] = res.data.users;

    if (!user) {
      return response.status(400).send({
         message: 'Wrong e-mail!'
      });
    }

    const metched = await bcrypt.compare(password, user.password);

    if (!metched) {
      return response.status(400).send({
         message: 'Wrong password!'
      });
    }

    console.log("res", JSON.stringify(user));
    return response.json({
      accessToken: generateAccessToken(user, hasura_admin_secret),
      userId: user.id
    })
  })
  .catch(() => {
    return response.status(400).send({
       message: 'This is an error!'
    })
  });
});

app.post("/viewer", async function(request, response) {
  const { hasura_endpoint, hasura_admin_secret, authorization }: any = request.headers;

  const {sub: id, name} = await getTokenContents(authorization, hasura_admin_secret);
  console.log("user id", id) // bar


  /*
  // In case of errors:
  return res.status(400).json({
    message: "error happened"
  })
  */

  // success
  return response.json({
    accessToken: generateAccessToken({id, name}, hasura_admin_secret),
    userId: id
  })

});

// The `listen` method launches a web server.
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server ready on ${process.env.PORT}`);
});
