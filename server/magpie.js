'use strict';
let request = require('request-promise')
let AUTH_TOKEN_COOKIE = "";

module.exports = {
  signin: () => {
    return new Promise((resolve, reject) => {
      let j = request.jar();
      let url = `${process.env.MAGPIE_HOST}/signin`;
      console.log(`Signing in to magpie at url ${url}`)
      request.post({
        url: url,
        resolveWithFullResponse: true,
        formData: {
          user_name: process.env.MAGPIE_ADMIN_USER,
          password: process.env.MAGPIE_ADMIN_PASSWORD
        },
        jar: j,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          AUTH_TOKEN_COOKIE = j.getCookieString(url);
          resolve(AUTH_TOKEN_COOKIE);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  session: (token) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/session`;
      console.log(`Fetching session from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  // Not working ATM
  getCurrentResourcePermission: ((token, resourceId) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/users/current/resources/${resourceId}/permissions`;
      console.log(`Fetching permissions of current user for resource ${resourceId} from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body['permission_names']);
        })
        .catch((error) => {
          reject(error);
        });
    })
  }),
  getCurrentUserGroups: ((token) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/users/current/groups`;
      console.log(`Fetching groups of current user from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body['group_names']);
        })
        .catch((error) => {
          reject(error);
        });
    })
  }),
  getGroupUsers: (group) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/groups/${group}/users`;
      console.log(`Fetching users of group ${group} from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body['user_names']);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  getUserResources: (user, serviceName = process.env.MAGPIE_PROJECT_SERVICE_TYPE) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/users/${user}/inherited_resources`;
      console.log(`Fetching resources for user ${user} and service ${serviceName} from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          let sanitizedResources = [];
          if(response.body["resources"][serviceName]) {
            let resources = response.body["resources"][serviceName][serviceName]["resources"];
            sanitizedResources = Object.keys(resources).map(p => resources[p]);
          }
          resolve(sanitizedResources);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  // deprecated for now, such route only support admin token
  getResources: (token = AUTH_TOKEN_COOKIE, serviceName = process.env.MAGPIE_PROJECT_SERVICE_TYPE) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/services/${serviceName}/inherited_resources`;
      console.log(`Fetching resources for service ${serviceName} from magpie at url ${url}`);
      // console.log(`Token used: ${token}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true,
        json: true
      })
      .then((response) => {
        console.log(response.body);
        let resources = [];
        if(response.body[serviceName]) {
          let resource = response.body[serviceName].resources;
          resources = Object.keys(resource).map(p => resource[p]);
        }
        resolve(resources);
      })
      .catch((error) => {
        reject(error);
      });
    })
  },
  addResourcePermission: (resourceId, user, permission) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/users/${user}/resources/${resourceId}/permissions`;
      console.log(`Creating permission ${permission} in magpie at url ${url}`);
      request.post({
        url: url,
        body: {
          "permission_name": permission
        },
        json: true,
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE,
          'Content-Type' : 'application/json',
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  registerResource: (resourceName, resourceType = 'file', serviceName = process.env.MAGPIE_PROJECT_SERVICE_TYPE) => {
    // This method needs the admin privileges to be executed with success
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/services/${serviceName}/resources`;
      console.log(`Registering a new resource in magpie at url ${url}`);
      request.post({
        url: url,
        body: {
          "resource_name": resourceName,
          "resource_type": resourceType
        },
        headers: {
          'Content-Type' : 'application/json',
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true,
        json: true
      })
      .then((response) => {
        console.log(response.body);
        resolve(response.body);
      })
      .catch((error) => {
        reject(error);
      });
    })
  },
  deleteResource: (resourceId) => {
    // This method needs the admin privileges to be executed with success
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/resources/${resourceId}`;
      console.log(`Deleteting a resource in magpie at url ${url}`);
      request.del({
        url: url,
        method: 'DELETE',
        body: {},
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE,
          'Content-type': 'application/json'
        },
        resolveWithFullResponse: true,
        json: true
      })
        .then((response) => {
          console.log(response.body);
          resolve(response.body);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  isAdminLogged: () => {
    return AUTH_TOKEN_COOKIE.length > 0;
  },
  getAdminToken: () => {
    return AUTH_TOKEN_COOKIE
  }
};
