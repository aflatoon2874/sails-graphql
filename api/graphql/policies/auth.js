/**
 * auth.js
 *
 * A simple policy that
 *  a) establishes identity of a user based on a jwt token
 *  b) allow access to resources based on role-based ACL
 *
 */

const { checkPermission } = require('./permission');

module.exports = {
  _authenticate: async (context) => {

    let req = context.req;

    /* Uncomment this sample code and adapt to implement your own JWT authentication
    let message = 'Access denied. You need to be loggedin to access this resource.';

    if (
      !req ||
      !req.headers ||
      (!req.headers.authorization && !req.headers.Authorization)
    ) {
      return {
        errors: [
          {
            code: 'I_AUTHTOKEN_MISSING',
            message: message
          }
        ]
      };
    }

    let token = req.headers.authorization || req.headers.Authorization;
    // Check presence of Auth Token and decode
    if (!token) {
      // Otherwise, this request did not come from a logged-in user.
      return {
        errors: [
          {
            code: 'I_AUTHTOKEN_MISSING',
            message: message
          }
        ]
      };
    }

    if (!token.startsWith('Bearer ')) {
      // Otherwise, this request did not come from a logged-in user.
      return {
        errors: [
          {
            code: 'E_AUTHTYPE_INVALID',
            message: message
          }
        ]
      };
    }

    token = token.substring(7);
    let result = {};
    try {
      result = await TokenService.decode({token: token});
    } catch (err) {
      sails.log.error('auth._authenticate: Error encountered: ', err);
      return {
        errors: [
          {
            code: 'E_DECODE',
            message: message
          }
        ]
      };
    }

    const now = Date.now() / 1000;
    if (result.exp <= now) {
      sails.log.info(`auth._authenticate: Access denied for: [${result.userName}] as the Auth Token has expired.`);
      return {
        errors: [
          {
            code: 'I_TOKEN_EXPIRED',
            message: message
          }
        ]
      };
    }
    */

    // When you implement your own authentication mechanism, 
    // remove the hard-coded result variable below.
    let result = {
      id: 1,
      fullName: 'Test',
      emailAddress: 'test@test.test',
      isRoleAdmin: false,
      roleId: 1
    };

    // Set the user object in graphql object for reference in subsequent processing
    context.user = result;
    return result;
  }, // end _authenticate()

  _authorize: async (user, expectedScope) => {
    let isAllowed = false;

    const scopeSplit = expectedScope.toLowerCase().split(':');
    const resource = scopeSplit[0].trim();
    const permission = scopeSplit[1].trim();
    if (scopeSplit.length > 2) {
      if (scopeSplit[2] === 'admin') {
        if (user.isRoleAdmin) {
          isAllowed = await checkPermission(user.roleId, permission, resource);
        }
      }
    } else {
      isAllowed = await checkPermission(user.roleId, permission, resource);
    }

    if (!isAllowed) {
      sails.log.info('auth._authorize: Access denied for: ');
      sails.log.info('  User:', user.fullName, '(' + user.emailAddress + ')');
      sails.log.info('  Valid Resource:Scope is: ', expectedScope);
    }
    return isAllowed;
  } // end _authorize()

};
