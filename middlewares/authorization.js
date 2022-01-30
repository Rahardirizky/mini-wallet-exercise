const { verifyToken } = require("../helpers/jwt");

const authorization = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (token) {
      token = token.split(" ")[1];
      req.customer_xid = verifyToken(token);
      next();
    } else {
      res.status(403).json({data: {authorization: ["Unauthorized"]} ,status: "fail"})
      return
    }
  } catch (error) {
    res.status(403).json({data: {authorization: ["Unauthorized"]} ,status: "fail"})
  }
};

module.exports = authorization;
