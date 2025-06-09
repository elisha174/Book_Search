//import { saveBook } from '../controllers/user-controller.js';
import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';


////User type:
// _id
// username
// email
// bookCount
// savedBooks (This will be an array of the Book type.)

// Book type:
// bookId (Not the _id, but the book's id value returned from Google's Book API.)
// authors (An array of strings, as there may be more than one author.)
// description
// title
// image
// link

// Auth type:
// token
// user (References the User type.)

// Mutation type:
// login: Accepts an email and password as parameters; returns an Auth type.
// addUser: Accepts a username, email, and password as parameters; returns an Auth type.
// saveBook: Accepts a book author's array, description, title, bookId, image, and link as parameters; returns a User type. (Look into creating what's known as an input type to handle all of these parameters!)
// removeBook: Accepts a book's bookId as a parameter; returns a User type.



interface LoginArgs {
  email: string;
  password: string;
}

interface addUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  }      
}

interface saveBookArgs {
  book: {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
  };
}

interface removeBookArgs {
  bookId: string; // The ID of the book to be removed
}


const resolvers = {
  Query: {
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (_parent: any, _args: any, context: any) => {
      // If the user is authenticated, find and return the user's information along with their thoughts
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      // If the user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError('Could not authenticate user.');
    },
  },

  Mutation: {
    addUser: async (_parent: unknown, { input }: addUserArgs): Promise<{ token: string; profile: any }> => {
      const profile = await User.create(input);
      const token = signToken(profile.username, profile.email, profile._id);
      return { token, profile };
    },
    login: async (_parent: unknown, { email, password }: LoginArgs): Promise<{ token: string; profile: any }> => {
      const profile = await User.findOne({ email });
      if (!profile) {
        throw new AuthenticationError('Could not find user with this email address');
      }
      const isPasswordValid = await profile.isCorrectPassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Incorrect password');
      }
      const token = signToken(profile.username, profile.email, profile._id);
      return { token, profile };
    },
    saveBook: async (_parent: unknown, { book }: saveBookArgs, context: any): Promise<any> => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        ).populate('savedBooks');
      }
      throw new AuthenticationError('Could not find user');
    },
    removeBook: async (_parent: unknown, { bookId }: removeBookArgs, context: any): Promise<any> => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
      }
      throw new AuthenticationError('Could not find user');
    },
  },
};

export default resolvers;
