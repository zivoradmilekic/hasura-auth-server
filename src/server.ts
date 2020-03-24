import 'dotenv/config';
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import { query } from "graphqurl";

const LoginQuery = `query Login($email: String, $password: String) {
  users(where: {email: {_eq: $email}, password: {_eq: $password}}) {
    id
    username
    email
    name
  }
}`;

const SignupMutation = `mutation Signup($name: String, $username: String, $email: String, $password: String) {
  insert_users (objects: {
    name: $name,
    username: $username,
    email: $email,
    password: $password
  }) {
    returning {
      id
      username
      email
      name
    }
  }
}`;

// Create Express server
const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", async (req: Request, res: Response) => {
  res.send(
    jwt.sign(
      {
        foo: 'bar',
        data: 'foobar'
      },
      process.env.HASURA_SECRET
    )
  );
});

app.post("/login", async (req: Request, res: Response) => {
  const {email, password} = req.body;

  query(
    {
      query: LoginQuery,
      variables: {
        email,
        password
      },
      endpoint: process.env.HASURA_ENDPOINT,
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_SECRET,
      }
    }
  ).then(({data}: any) => {
    console.log("login", JSON.stringify(data, null, 2));
    res.send(
      jwt.sign(
        { ...data.users[0] },
        process.env.HASURA_SECRET
      )
    );
  })
  .catch((error: any) => {
    res.send(JSON.stringify(error, null, 2));
  });
});

app.post("/signup", async (req: Request, res: Response) => {
  const {name, username, email, password} = req.body;

  query(
    {
      query: SignupMutation,
      variables: {
        name,
        username,
        email,
        password
      },
      endpoint: process.env.HASURA_ENDPOINT,
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_SECRET,
      }
    }
  ).then(({data}: any) => {
    console.log("signup", JSON.stringify(data, null, 2));
    res.send(
      jwt.sign(
        { ...data.users[0] },
        process.env.HASURA_SECRET
      )
    );
  })
  .catch((error: any) => {
    res.send(JSON.stringify(error, null, 2));
  });
});

app.listen(process.env.PORT, () => {
  console.log(
    "App is running at http://localhost:%d in %s mode",
    process.env.PORT,
    'develompent'
  );
  console.log("  Press CTRL-C to stop\n");
});
