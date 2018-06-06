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
  session: (token) => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/session`;
      console.log(`Fetching session from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          resolve(JSON.parse(response.body));
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  getUserResources: (user, serviceName = 'project-api') => {
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/users/${user}/resources`;
      console.log(`Fetching resources for user ${user} and service ${serviceName} from magpie at url ${url}`);
      request.get({
        url: url,
        headers: {
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          // console.log(response.body);
          let resources = JSON.parse(response.body)["resources"][serviceName][serviceName]["resources"];
          let sanitizedResources = Object.keys(resources).map(p => resources[p]);
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
      let url = `${process.env.MAGPIE_HOST}/services/${serviceName}/resources`;
      console.log(`Fetching resources for service ${serviceName} from magpie at url ${url}`);
      // console.log(`Token used: ${token}`);
      request.get({
        url: url,
        headers: {
          'Cookie': token
        },
        resolveWithFullResponse: true
      })
      .then((response) => {
        console.log(response.body);
        let resource = JSON.parse(response.body)[serviceName].resources;
        let resources = Object.keys(resource).map(p => resource[p]);
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
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          //console.log(response.body);
          //resolve(JSON.parse(response.body));
          resolve(response.body);
        })
        .catch((error) => {
          reject(error);
        });
    })
  },
  tempRegisterResource: (resourceName, resourceType = 'file', parentId = 148) => {
    // This method needs the admin privileges to be executed with success
    // TODO: Eventually switch to the other method
    return new Promise((resolve, reject) => {
      let url = `${process.env.MAGPIE_HOST}/resources`;
      console.log(`Registering a new resource with name ${resourceName} in magpie at url ${url}`);
      request.post({
        url: url,
        form: {
          "resource_name": resourceName,
          "resource_type": resourceType,
          "parent_id": parentId
        },
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
        .then((response) => {
          resolve(JSON.parse(response.body));
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
          'Cookie': AUTH_TOKEN_COOKIE
        },
        resolveWithFullResponse: true
      })
      .then((response) => {
        resolve(JSON.parse(response.body));
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
  isAdminLogged: () => {
    return AUTH_TOKEN_COOKIE.length > 0;
  },
  getAdminToken: () => {
    return AUTH_TOKEN_COOKIE
  }
};
