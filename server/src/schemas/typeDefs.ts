
const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    bookCount: String
    savedBooks: [Book]!
  }

  type Book {
    _bookId: ID
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  type Auth {
    token: ID!
    user: User
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
  }
  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(input: UserInput!): Auth
    saveBook(
      authors: [String]!
      description: String!
      title: String!
      bookId: ID!
      image: String
      link: String
    ): User
    removeBook(bookId: ID!): User
  }
`;

export default typeDefs;

