/**
 * AuthorSchema.js
 */
const { _getAuthor, _addAuthor, _updateAuthor, _deleteAuthor } = require('../helpers/AuthorHelper');
const { _getBook } = require('../helpers/BookHelper');

module.exports = {
  typeDefs: {
    types: `
      # model=Author
      type Author {
        # Unique identifier (Primary key in database for this model entity)
        id: Int!
        # Name
        name: String!
        # Country
        country: String
        # Books
        books: [Book] @authorize(scope: "book:read")
      }

      input AuthorInput {
        name: String
        country: String
      }

      # define unions
      union AuthorResponse = Author | ErrorResponse

    `, // end of types

    queries: `
      getAuthors(filter: String): [AuthorResponse] @authorize(scope: "author:read") @authenticate
      getAuthor(id: Int!): AuthorResponse @authorize(scope: "author:read") @authenticate
    `, // end of queries

    mutations: `
      addAuthor(data: AuthorInput!): AuthorResponse @authorize(scope: "author:add") @authenticate
      updateAuthor(id: Int!, data: AuthorInput!): AuthorResponse @authorize(scope: "author:update") @authenticate
      deleteAuthor(id: Int!): AuthorResponse @authorize(scope: "author:delete") @authenticate
    `, // end of mutations
  }, // end of typeDefs

  resolvers: {
    queries: {
      getAuthors: async (parent, args, context) => {
        const result = await _getAuthor({ where: args.filter });
        if (!(result instanceof Array)) {
          return [ result ];
        }
        if (result.length === 0) {
          return [ { errors: [ { code: 'I_INFO', message: 'No data matched your selection criteria'}]} ];
        }
        return result;
      },
      getAuthor: async (parent, args, context) => {
        return _getAuthor(args);
      },
    },

    mutations: {
      addAuthor: async (parent, args, context) => {
        return _addAuthor(args.data);
      },
      updateAuthor: async (parent, args, context) => {
        return _updateAuthor(args.id, args.data);
      },
      deleteAuthor: async (parent, args, context) => {
        return _deleteAuthor(args.id);
      },
    },

    references: {

      Author: {
        books: (author, _, context) => {
          if (author === null) {
            return null;
          }
          const args = {
            where: {
              author: author.id
            }
          };
          const result = _getBook(args);
          if (typeof result !== Array) {
            return [ result ];
          }
          return result;
        },

      },

      AuthorResponse: {
        __resolveType(obj, context, info) {
          if (obj.errors) {
            return 'ErrorResponse';
          } else {
            return 'Author';
          }
        },
      },

    } // end of references
  } // end of resolvers
};
