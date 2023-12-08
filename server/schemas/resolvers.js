const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new Error("You need to be logged in!");
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const User = await User.findOne({ email });
      if (!User) {
        throw new Error("No profile with this email found!");
      }
      const correctPw = await User.isCorrectPassword(password);
      if (!correctPw) {
        throw new Error("Incorrect password!");
      }
      const token = signToken(User);
      return { token, User };
    },
    addUser: async (parent, { username, email, password }) => {
      const User = await User.create({ username, email, password });
      const token = signToken(User);
      return { token, User };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const User = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        );
        return User;
      }
      throw new Error("You need to be logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const User = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return User;
      }
      throw new Error("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
