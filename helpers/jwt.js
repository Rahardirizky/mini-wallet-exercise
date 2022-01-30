const jwt = require('jsonwebtoken')

const getToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET)
}
const verifyToken = (token) => jwt.verify(token, process.env.SECRET)

module.exports = {
  getToken,
  verifyToken
}