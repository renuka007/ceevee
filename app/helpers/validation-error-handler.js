/**
 * Adds `toJSON` method to format validation errors as:
 *
 *     {errors: {errorKey: ["error kind"]}}
 */
export default (req, res, err, next) => {
  err.statusCode = 422;
  err.toJSON = () => {
    const errJSON = {
      errors: {}
    };
    Object.keys(err.errors).forEach((key) => {
      errJSON.errors[key] = [err.errors[key].kind];
    });
    return(errJSON);
  };
  next();
};
