/**
 * schema.js
 */
const { makeExecutableSchema } = require('graphql-tools');
const { _authenticate, _authorize } = require('../policies/auth');
const book = require('./BookSchema');
const author = require('./AuthorSchema');

// Construct a schema using the GraphQL schema language
const typeDefs = `
  directive @authenticate(returnType: String) on FIELD_DEFINITION | FIELD
  directive @authorize(scope: String!, returnType: String) on FIELD_DEFINITION | FIELD

  type Error {
    code: String!
    message: String!
    attrName: String
    row: Int
    moduleError: ModuleError
  }

  type ModuleError {
    code: String!
    message: String!
    attrNames: [String]
  }

  type ErrorResponse {
    errors: [Error]
  }

  ${book.typeDefs.types}
  ${author.typeDefs.types}

  type Query {
    ${book.typeDefs.queries}
    ${author.typeDefs.queries}
  }

  type Mutation {
    ${book.typeDefs.mutations}
    ${author.typeDefs.mutations}
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    ...book.resolvers.queries,
    ...author.resolvers.queries
  },

  Mutation: {
    ...book.resolvers.mutations,
    ...author.resolvers.mutations
  },
  ...book.resolvers.references,
  ...author.resolvers.references
};

const directiveResolvers = {
  // Will be called when a @authenticate directive is applied to a field or field definition.
  async authenticate(resolve, parent, directiveArgs, context, info) {
    if (context.user === undefined) {
      user = await _authenticate(context);
      if (user.errors !== undefined) {
        return directiveArgs.returnType === 'array' ? [ user ] : user; // user authentication failed
      }
    }
    return resolve();
  },

  // Will be called when a @authorize directive is applied to a field or field definition.
  async authorize(resolve, parent, directiveArgs, context, info) {
    if (!await _authorize(context.user, directiveArgs.scope)) {
      let err = {
        errors: [
          {
            code: 'E_NO_PERMISSION',
            message: 'Expected resource Authorization: ' + directiveArgs.scope
          }
        ]
      };
      return directiveArgs.returnType === 'array' ? [ err ] : err;
    }
    return resolve();
  }
};

// Get a GraphQL.js Schema object
module.exports.schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers
});
