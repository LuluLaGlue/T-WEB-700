function paramsCheck(body, ...params) {
  let missing = [];
  for (let i = 0; i < params.length; i++) {
    if (!body.hasOwnProperty(params[i])) {
      missing.push(params[i]);
    }
  }
  if (missing.length !== 0) {
    return { success: false, error: missing };
  }
  return { success: true };
}

module.exports = paramsCheck;