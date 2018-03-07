/**
 * Adds `toJSON` method to format restify errors as:
 *
 *     {errors: {base: ["ErrorName"]}}
 */
export default (req, res, err, next) => {
  if (err.body) {
    err.toJSON = () => {
      return {
        errors: {
          base: [err.body.code]
        }
      };
    };
  }
  next();
};
