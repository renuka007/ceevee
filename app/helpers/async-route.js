import { UnprocessableEntityError } from 'restify-errors';

export default fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((e) => {
    if (e.name === 'ValidationError') {
      // Pass validation errors as is.
      next(e);
    } else {
      // All errors other than validation errors result in the same response.
      // This helps to prevent leaking internal server state.
      next(new UnprocessableEntityError());
    }
  });
};
