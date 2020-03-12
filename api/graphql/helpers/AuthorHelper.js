/**
 * AuthorHelper.js
 *
 * @description :: Server-side actions for handling incoming requests.
 */

module.exports = {

  /*
   * @Function:     _addAuthor(input)
   * @Description:  Add one record of Author
   * @Params:       input - dictionary of fields to be added
   * @Return:       Author | ErrorResponse
   */
  _addAuthor: async (input) => {
    const name = input.name;
    const country = input.country || 'UNKNOWN';
    let payLoad = {};

    // Validate user input

    if (name === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'name',
            message: 'Name is required and should be of type "string"'
          }
        ]
      };
    }

    if (typeof name !== 'string') {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'name',
            message: 'Name should be of type "string"'
          }
        ]
      };
    }

    if (country === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'country',
            message: 'Country is required and should be of type "string"'
          }
        ]
      };
    }

    if (typeof country !== 'string') {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'country',
            message: 'Country should be of type "string"'
          }
        ]
      };
    }

    // All input validated, now set the payLoad values
    payLoad.name = name;
    payLoad.country = country;

    try {
      // insert new record
      let result = await Author.create(payLoad).fetch();

      // Success
      sails.log.debug(`AuthorHelper._addAuthor: Author successfully added:`, result);
      return result;
    } catch (err) {
      sails.log.debug('AuthorHelper._addAuthor: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Author add request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _addAuthor()

  /*
   * @Function:     _updateAuthor(id, input)
   * @Description:  Update one record of Author
   * @Params:       id - Author Id
   *                input - dictionary of rest of fields to be updated
   * @Return:       Author | ErrorResponse
   */
  _updateAuthor: async (id, input) => {
    const name = input.name;
    const country = input.country;

    if (!id) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'id',
            message: 'Id is required for updation.'
          }
        ]
      };
    }

    let valueNotSet = true;
    let payLoad = {};
    // now set the payLoad value(s)
    if (name !== undefined) {

      if (typeof name !== 'string') {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'name',
              message: 'Name should be of type "string"'
            }
          ]
        };
      }

      valueNotSet = false;
      payLoad.name = name;
    } // end if

    if (country !== undefined) {

      if (typeof country !== 'string') {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'country',
              message: 'Country should be of type "string"'
            }
          ]
        };
      }

      valueNotSet = false;
      payLoad.country = country;
    } // end if

    if (valueNotSet) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: '',
            message: 'No value(s) sent for updation.'
          }
        ]
      };
    }

    try {
      let result = await Author.updateOne()
        .set(payLoad)
        .where({
          id: id
        }); // .fetch() not required for updateOne() as it always returns the updated record or undefined if not found

      // Success
      result = result || { errors: [ { code: 'I_INFO', message: `No Author exists with the requested Id: ${id}`} ] };
      sails.log.debug(`AuthorHelper._updateAuthor: Author successfully updated:`, result);
      return result;
    } catch (err) {
      sails.log.debug('AuthorHelper._updateAuthor: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Author update request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _updateAuthor()

  /*
   * @Function:     _deleteAuthor(id)
   * @Description:  Delete one record of Author
   * @Params:       id - Author Id
   * @Return:       Author | ErrorResponse
   */
  _deleteAuthor: async (id) => {
    if (!id) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'id',
            message: 'Id is required for deletion.'
          }
        ]
      };
    }

    try {
      let result = await Author.destroyOne({id});

      // Success
      result = result || { errors: [ { code: 'I_INFO', message: `No Author exists with the requested Id: ${id}`} ] };
      sails.log.debug(`AuthorHelper._deleteAuthor: Author successfully deleted:`, result);
      return result;
    } catch (err) {
      sails.log.debug('AuthorHelper._deleteAuthor: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Author delete request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _deleteAuthor()

  /*
   * @Function:     _getAuthor(input)
   * @Description:  Fetch one or more record(s) of Author
   * @Params:       input - dictionary with either Author Id or a filter criteria
   * @Return:       Author | [Author] | ErrorResponse
   */
  _getAuthor: async (input) => {
    const id = input.id;
    let where = input.where || {};

    if (typeof where === 'string') {
      try {
        where = JSON.parse(where);
      } catch(err) {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'where',
              message: 'Where clause should be a valid JSON object.'
            }
          ]
        };
      } // end try
    }

    if (id) {
      where.id = id;
    }

    try {
      // Now fetch the record(s) from database
      let result = await Author.find().where(where);

      if (id) {
        if (result.length > 0) {
          result = result[0];
        } else {
          result = { errors: [ { code: 'I_INFO', message: `No Author exists with the requested Id: ${id}`} ] };
        }
      }

      // Success
      sails.log.debug(`AuthorHelper._getAuthor: Author(s) successfully retrieved:`, result);
      return result;
    } catch(err) {
      sails.log.debug('AuthorHelper._getAuthor: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: 'Author fetch request failed.',
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _getAuthor()
};
