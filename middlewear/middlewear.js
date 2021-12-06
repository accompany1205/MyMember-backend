const unknownEndpoint = (request, response) => {
  response.status(404).send({ msg: "Unknown endpoint" ,success:false});
};

const errorHandler = (error, request, response, next) => {
  if (error.status) {
    return response
      .status(error.status)
      .send({ success: false, msg: error.message });
  }
  if (error.name === "CastError") {
    return response.json({
      error: error.name,
      message: `Invalid Data in ${error.path}`,
    });
  }
  if (error.message) {
    return response.status(400).json({ msg: error.message, success: false });
  }
  return response.status(500).json({ msg: error.message, success: false });
};

module.exports = {
  unknownEndpoint,
  errorHandler,
};
