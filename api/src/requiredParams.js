function paramsCheck(body, ...params) {
  for (let i = 0; i < params.length; i++) {
    if (!body.hasOwnProperty(params[i])) {
      return { success: false, error: params[i] }
    }
  }
  return { success: true };
}

module.exports = paramsCheck;