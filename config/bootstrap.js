/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also do this by creating a hook.
 *
 * For more information on bootstrapping your app, check out:
 * https://sailsjs.com/config/bootstrap
 */
const graphqlHTTP = require('express-graphql');
const { schema } = require('../api/graphql/schemas/schema');

module.exports.bootstrap = async function(done) {
  sails.hooks.http.app.use('/graphql',
    graphqlHTTP((req, res) => ({
      schema: schema,
      // rootValue: root,
      context: { req },
      graphiql: false
    }))
  );

  // Don't forget to trigger `done()` when this bootstrap function's logic is finished.
  // (otherwise your server will never lift, since it's waiting on the bootstrap)
  return done();

};
