function response(status, body) {
  return {
    status: status,
    data: body
  }
}

module.exports = response;