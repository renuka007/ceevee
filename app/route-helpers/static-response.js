/**
 * Returns a route handler function that always responds with the given payload.
 */
const staticResponse = (payload) => {
  return (req, res) => {
    res.send(payload);
  };
};

export default staticResponse;
