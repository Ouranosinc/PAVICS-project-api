const LoopBackContext = require('loopback-context');

module.exports = function(options) {
  return (req, res, next) => {
    console.log(`middleware store-current-token is being executed...`);

    // Log for debugging only
    // console.log('Cookies: %o', req.cookies.auth_tkt);

    var loopbackContext = LoopBackContext.getCurrentContext();
    loopbackContext.set('currentToken', (req.cookies.auth_tkt)?`auth_tkt=${req.cookies.auth_tkt}`: null);

    next();
  };
};
