'use strict';
let request = require('request-promise')
let AUTH_TOKEN_COOKIE = "";

module.exports = {
  signin: () => {
    return new Promise((resolve, reject) => {
      let j = request.jar();
      let url = `${process.env.MAGPIE_BASE_URL}/signin`;
      console.log(`Signing in to magpie at url ${url}`)
      request.post({
        url: url,
        resolveWithFullResponse: true,
        formData: {
          user_name: "david",
          password: "david",
          provider_name: "ziggurat"
        },
        jar: j
      })
        .then((response) => {
          AUTH_TOKEN_COOKIE = j.getCookieString(url);
          resolve(AUTH_TOKEN_COOKIE);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  getResources: (token = AUTH_TOKEN_COOKIE, serviceName = 'project-api') => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_BASE_URL}/services/${serviceName}/resources`;
      console.log(`Fetching resources for service ${serviceName} from magpie at url ${url}`);
      console.log(`Token used: ${token}`);
      request.get({
        url: url,
        /*headers: {
          'Cookie': token
        },*/
        resolveWithFullResponse: true
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
    })
  },
  addResourcePermission: (resourceId, user, permission) => {
    // TODO
  },
  registerResource: (resourceName, resourceType = 'file', serviceName = 'project-api') => {
    // This method needs the admin privileges to be executed with success
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_BASE_URL}/services/${serviceName}/resources`;
      console.log(`Registering a new resource in magpie at url ${url}`);
      request.post({
        url: url,
        body: {
          "resource_name": resourceName,
          "resource_type": resourceType
        },
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
    })
  },
  deleteResource: (resourceId) => {
    // This method needs the admin privileges to be executed with success
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_BASE_URL}/resources/${resourceId}`;
      console.log(`Deleteting a resource in magpie at url ${url}`);
      request.delete({
        url: url,
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  isLogged: () => {
    return AUTH_TOKEN_COOKIE.length > 0;
  },
  getToken: () => {
    return AUTH_TOKEN_COOKIE
  }
};
