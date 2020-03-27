import { gql } from 'apollo-server';

export const MeQuery = gql`query Me ($id: uuid!) {
  users(where: {id: {_eq: $id}}) {
    id
    name
    username
    email
  }
}`;

export const LoginQuery = gql`query Login($email: String, $password: String) {
  users(where: {email: {_eq: $email}, password: {_eq: $password}}) {
    id
    name
    username
    email
  }
}`;

export const SignupMutation = gql`mutation Signup($name: String, $username: String, $email: String, $password: String) {
  insert_users (objects: {
    name: $name,
    username: $username,
    email: $email,
    password: $password
  }) {
    returning {
      id
      name
      username
      email
    }
  }
}`;
