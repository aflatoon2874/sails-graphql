/**
 * BookSchema.js
 */
const { _getBook, _addBook, _updateBook, _deleteBook } = require('../helpers/BookHelper');
const { _getAuthor } = require('../helpers/AuthorHelper');

module.exports = {
  typeDefs: {
    types: `
      # model=Book
      type Book {
        # Unique identifier (Primary key in database for this model entity)
        id: Int!
        # Title
        title: String!
        # Year Published
        yearPublished: String!
        # Genre
        genre: String
        # Author
        author: Author! @authorize(scope: "author:read")
      }

      input BookInput {
        title: String
        yearPublished: String
        genre: String
        authorId: Int
      }

      # define unions
      union BookResponse = Book | ErrorResponse

    `, // end of types

    queries: `
      getBooks(filter: String): [BookResponse] @authorize(scope: "book:read", returnType: "array") @authenticate(returnType: "array")
      getBook(id: Int!): BookResponse @authorize(scope: "book:read") @authenticate
    `, // end of queries

    mutations: `
      addBook(data: BookInput!): BookResponse @authorize(scope: "book:add") @authenticate
      updateBook(id: Int!, data: BookInput!): BookResponse @authorize(scope: "book:update") @authenticate
      deleteBook(id: Int!): BookResponse @authorize(scope: "book:delete") @authenticate
    `, // end of mutations
  }, // end of typeDefs

  resolvers: {
    queries: {
      getBooks: async (parent, args, context) => {
        const result = await _getBook({ where: args.filter });
        if (!(result instanceof Array)) {
          return [ result ];
        }
        if (result.length === 0) {
          return [ { errors: [ { code: 'I_INFO', message: 'No data matched your selection criteria'}]} ];
        }
        return result;
      },
      getBook: async (parent, args, context) => {
        return _getBook(args);
      },
    },

    mutations: {
      addBook: async (parent, args, context) => {
        return _addBook(args.data);
      },
      updateBook: async (parent, args, context) => {
        return _updateBook(args.id, args.data);
      },
      deleteBook: async (parent, args, context) => {
        return _deleteBook(args.id);
      },
    },

    references: {

      Book: {
        author: (book, _, context) => {
          if (book === null) {
            return null;
          }
          const args = {
            id: book.author
          };
          return _getAuthor(args);
        },

      },

      BookResponse: {
        __resolveType(obj, context, info) {
          if (obj.errors) {
            return 'ErrorResponse';
          } else {
            return 'Book';
          }
        },
      },

    } // end of references
  } // end of resolvers
};
