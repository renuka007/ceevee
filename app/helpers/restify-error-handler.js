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
