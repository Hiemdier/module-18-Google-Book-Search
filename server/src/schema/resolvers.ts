// This file is responsible for exporting the type definitions and resolvers for the GraphQL schema.
import { BookDocument } from '../models/Book.js';
import User from '../models/User.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

// interface for the User model
// This interface defines the structure of the User object
interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    savedBooks: BookDocument[];
    bookCount: number
}

// interface for the arguments passed to the user query
interface UserArgs {
    username: string
}

// interface for the arguments passed to the createUser mutation
interface CreateUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
        savedBooks: BookInput[]
    }
}

// interface for the arguments passed to the loginUser mutation
interface LoginArgs {
    email: string,
    password: string
}

// interface for the arguments passed to the saveBook mutation
interface BookInput {
    authors: [string];
    description: string;
    bookId: string;
    image: string;
    link: string;
    title: string;
}

// interface for the arguments passed to the deleteBook mutation
interface DeleteBookArgs {
    bookId: string
}


// The resolvers object contains the functions that resolve the queries and mutations defined in the GraphQL schema
const resolvers = {
    // The Query object contains the functions that resolve the queries
    Query: {
        user: async (_parent: any, { username }: UserArgs): Promise<User | null> => {
            return await User.findOne(
                { username }
            );
        },
        // The me query returns the authenticated user's profile
        me: async (_parent: any, _args: unknown, context: any): Promise<User | null> => {
            if (context.user) {
              // If user is authenticated, return their profile
              return await User.findOne({ _id: context.user._id });
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
          }
    },
    // The Mutation object contains the functions that resolve the mutations
    Mutation: {
        // The createUser mutation creates a new user and returns a token and the user object
        createUser: async (_parent: any, { input }: CreateUserArgs): Promise<{ token: string; user: User }> => {
           
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);
      
            return { user, token };
        },
        // The loginUser mutation logs in a user and returns a token and the user object
        loginUser: async (_parent: any, { email, password}: LoginArgs): Promise<{ token: string; user: User }> => {
         
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

      
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Not authenticated')
            }

            const token = signToken(user.username, user.email, user.id);

            return { token, user }
        },
        // The saveBook mutation saves a book to the user's profile and returns the updated user object
        saveBook: async (_parent: any, { input }: { input: BookInput }, context: any): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                )
            }

            throw new AuthenticationError('Could not find user');
        },
        // The deleteBook mutation deletes a book from the user's profile and returns the updated user object
        removeBook: async (_: any, { bookId }: DeleteBookArgs, context: any): Promise<User | null> => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            return updatedUser;
        },
    }
};

// Export the resolvers object
export default resolvers