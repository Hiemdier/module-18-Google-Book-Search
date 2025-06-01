import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
mutation login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
        token
        user {
            _id
            name
        }
    }
}
`;

export const ADD_USER = gql`
mutation createUser($input: UserInput!) {
   createUser(input: $input) {
     token
     user {
       _id
       username
     }
   }
 }
 `

export const SAVE_BOOK = gql`
    mutation saveBook($input: BookInput!) {
        saveBook(input: $input) {
            _id
            username
            email
            bookCount
            savedBooks {
                bookId
                title
                authors
                description
                image
                link
            }
        }
    }
`

export const REMOVE_BOOK = gql`
  mutation removeBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;