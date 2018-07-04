'use strict';
let magpie = require('./../magpie');

module.exports = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth();

  // Not working at the moment, and not sure how to extract cookie from it anyway
  /*var magpie = app.datasources.magpie;
  magpie.signin((result) =>  {
    console.log(result);
  })*/

  console.log('Signin into magpie to get an admin access token')
  magpie.signin()
    .then(token => {
      // Not using token at this point
      console.log('Logged into Magpie with success')
    })
    .catch(error => console.log(`${error.message}`));
};
