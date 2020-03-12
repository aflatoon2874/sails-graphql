/**
 * permission.js
 *
 * A simple policy for implementing RBAC
 *
 */

module.exports = {
  checkPermission: (roleId, permission, resource) => {
    console.log(`checkPermission() Role Id: ${roleId}, Permission: ${permission}, Resource: ${resource}`);

    // add your RBAC code here and return true for allow or false for disallow

    return true; // allow
  }
};
