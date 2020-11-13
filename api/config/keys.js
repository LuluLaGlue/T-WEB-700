var secureRandom = require('secure-random');

const variables = {
  api_url: "mongodb+srv://root:rootpwd@cluster0.it9ji.mongodb.net/test",
  secretOrKey: secureRandom(256, { type: 'Buffer' })
}

module.exports = variables;