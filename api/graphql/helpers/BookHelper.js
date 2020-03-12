/**
 * BookHelper.js
 *
 * @description :: Server-side actions for handling incoming requests.
 */

module.exports = {

  /*
   * @Function:     _addBook(input)
   * @Description:  Add one record of Book
   * @Params:       input - dictionary of fields to be added
   * @Return:       Book | ErrorResponse
   */
  _addBook: async (input) => {
    let validValuesArray = [];
    const title = input.title;
    const yearPublished = input.yearPublished;
    const genre = input.genre || 'UNKNOWN';
    const authorId = parseInt(input.authorId);

    let payLoad = {};

    // Validate user input

    if (title === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'title',
            message: 'Title is required and should be of type "string"'
          }
        ]
      };
    }

    if (typeof title !== 'string') {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'title',
            message: 'Title should be of type "string"'
          }
        ]
      };
    }

    if (yearPublished === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'yearPublished',
            message: 'Year Published is required and should be of type "string"'
          }
        ]
      };
    }

    if (typeof yearPublished !== 'string') {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'yearPublished',
            message: 'Year Published should be of type "string"'
          }
        ]
      };
    }

    if (genre === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'genre',
            message: 'Genre is required and should be one of "\'ADVENTURE\', \'COMICS\', \'FANTASY\', \'UNKNOWN\'"'
          }
        ]
      };
    }

    if (typeof genre !== 'string') {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'genre',
            message: 'Genre should be of type "string"'
          }
        ]
      };
    }

    validValuesArray = ['ADVENTURE','COMICS','FANTASY','UNKNOWN'];
    if (validValuesArray.find((val) => genre === val) === undefined) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'genre',
            message: 'Genre should be one of "\'ADVENTURE\', \'COMICS\', \'FANTASY\', \'UNKNOWN\'"'
          }
        ]
      };
    }

    if (authorId === undefined || Number.isNaN(authorId)) {
      return {
        errors: [
          {
            code: 'E_BAD_INPUT',
            attrName: 'authorId',
            message: 'Author Id is required and should be of type "integer"'
          }
        ]
      };
    }

    // All input validated, now set the payLoad values
    payLoad.title = title;
    payLoad.yearPublished = yearPublished;
    payLoad.genre = genre;
    payLoad.author = authorId;

    try {
      let result = null;
      // insert new record
      result = await Book.create(payLoad).fetch();

      // Success
      sails.log.debug(`BookHelper._addBook: Book successfully added:`, result);
      return result;
    } catch (err) {
      sails.log.debug('BookHelper._addBook: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Book add request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _addBook()

  /*
   * @Function:     _updateBook(id, input)
   * @Description:  Update one record of Book
   * @Params:       id - Book Id
   *                input - dictionary of rest of fields to be updated
   * @Return:       Book | ErrorResponse
   */
  _updateBook: async (id, input) => {
    let validValuesArray = [];

    // for new or update record
    const title = input.title;
    const yearPublished = input.yearPublished;
    const genre = input.genre;
    const authorId = input.authorId ?  parseInt(input.authorId) : undefined;

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


    if (title !== undefined) {

      if (typeof title !== 'string') {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'title',
              message: 'Title should be of type "string"'
            }
          ]
        };
      }

      valueNotSet = false;
      payLoad.title = title;
    } // end if

    if (yearPublished !== undefined) {

      if (typeof yearPublished !== 'string') {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'yearPublished',
              message: 'Year Published should be of type "string"'
            }
          ]
        };
      }

      valueNotSet = false;
      payLoad.yearPublished = yearPublished;
    } // end if

    if (genre !== undefined) {

      if (typeof genre !== 'string') {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'genre',
              message: 'Genre should be of type "string"'
            }
          ]
        };
      }

      validValuesArray = ['ADVENTURE','COMICS','FANTASY','UNKNOWN'];
      if (validValuesArray.find((val) => genre === val) === undefined) {
        return {
          errors: [
            {
              code: 'E_BAD_INPUT',
              attrName: 'genre',
              message: 'Genre should be one of "\'ADVENTURE\', \'COMICS\', \'FANTASY\', \'UNKNOWN\'"'
            }
          ]
        };
      }

      valueNotSet = false;
      payLoad.genre = genre;
    } // end if

    if (!(authorId === undefined || Number.isNaN(authorId))) {

      valueNotSet = false;
      payLoad.author = authorId;
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
      let result = await Book.updateOne()
        .set(payLoad)
        .where({
          id: id
        }); // .fetch() not required for updateOne() as it always returns the updated record or undefined if not found

      // Success
      result = result || { errors: [ { code: 'I_INFO', message: `No Book exists with the requested Id: ${id}`} ] };
      sails.log.debug(`BookHelper._updateBook: Book successfully updated:`, result);
      return result;
    } catch (err) {
      sails.log.debug('BookHelper._updateBook: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Book update request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _updateBook()

  /*
   * @Function:     _deleteBook(id)
   * @Description:  Delete one record of Book
   * @Params:       id - Book Id
   * @Return:       Book | ErrorResponse
   */
  _deleteBook: async (id) => {
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
      let result = null;

      result = await Book.destroyOne({id});
      // Success
      result = result || { errors: [ { code: 'I_INFO', message: `No Book exists with the requested Id: ${id}`} ] };
      sails.log.debug(`BookHelper._deleteBook: Book successfully deleted:`, result);
      return result;
    } catch (err) {
      sails.log.debug('BookHelper._deleteBook: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: `Book delete request failed.`,
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _deleteBook()

  /*
   * @Function:     _getBook(input)
   * @Description:  Fetch one or more record(s) of Book
   * @Params:       input - dictionary with either Book Id or a filter criteria
   * @Return:       Book | [Book] | ErrorResponse
   */
  _getBook: async (input) => {
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
      let result = await Book.find().where(where);

      if (id) {
        if (result.length > 0) {
          result = result[0];
        } else {
          result = { errors: [ { code: 'I_INFO', message: `No Book exists with the requested Id: ${id}`} ] };
        }
      }

      // Success
      sails.log.debug(`BookHelper._getBook: Book(s) successfully retrieved:`, result);
      return result;
    } catch(err) {
      sails.log.debug('BookHelper._getBook: Exception encountered:', err);
      return {
        errors: [
          {
            code: 'E_API_ERROR',
            message: 'Book fetch request failed.',
            moduleError: {
              code: err.code || 'E_ERROR',
              attrNames: err.attrNames || [],
              message: err.message
            }
          }
        ]
      };
    } // end try {}
  }, // end _getBook()
};
