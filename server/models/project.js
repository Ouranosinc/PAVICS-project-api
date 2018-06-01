'use strict';
const magpie = require('./../magpie');
const app = require('./../server');
const LoopBackContext = require('loopback-context');

module.exports = function(Project) {
  Project.share = (projectId, user,  cb) => {
    // TODO: Validate current token is the project owner or not since endpoint should be behind Twitcher project WRITE permission
    // TODO: Add "read" permission to the resource
    // TODO: Add "write" permission
    console.log(user);
    cb(null, projectId);
  };

  Project.remoteMethod('share', {
    accepts: [
      {arg: 'projectId', type: 'string', required: true},
      {arg: 'user', type: 'string', required: true}
    ],
    returns: {arg: 'id', type: 'string'},
    http: {path: '/share', verb: 'post'}
  });

  Project.observe('after save', (ctx, next) => {
    console.log('After saving a project hook');
    // console.log(ctx.http.req)

    if (ctx.instance) {
      // use ctx.instance
      console.log('After creating a project hook');
      if(!ctx.instance.magpieId) {
        Project.findOne({where: {id: ctx.instance.id}}, (err, data) => {
          console.log(data);
          // TODO: magpie.registerResource()
          // TODO: then, update magpieId project property
          // TODO: then, add user permission (ctx.instance.owner)
          ctx.instance.updateAttribute('magpieId', 'todoMapgieId', (res) => {
            next();
          });
        });
      } else {
        next();
      }
    } else {
      // use ctx.data
      console.log('After updating a project hook');
      if (!ctx.data.magpieId) {
        console.warn(`Warning: No magpieId property defined for project with id ${ctx.data.id}`);
      }
      next();
    }
  });

  Project.observe('before delete', (ctx, next) => {
    console.log('Before deleting a project hook');
    if (ctx.instance) {
      console.log('Delete instance....')
    } else {
      console.log('Delete no instance....')
      Project.findOne({where: {id: ctx.where.id}}, (err, data) => {
        console.log(data)
        next();
      });
    }
  });

  Project.observe('access', (ctx, next) => {
    // Filter when project are filtered by user accesses
    // Only for the project listing since other endpoint will be behind twitcher
    if(ctx.query && ctx.query.where && ctx.query.where.user) {
      console.log('Before listing projects hook');
      // Sadly, Http request (ctx.req) object does not exists in Loopback 3
      // The only way to actually extract cookies from request is by using loopback-context method
      let lbContext = LoopBackContext.getCurrentContext();
      let userToken = lbContext.get('currentToken');
      console.log(userToken);

      if(userToken && userToken.length) {
        console.log('There\'s a token in the request');
        magpie.getResources(userToken)
          .then((data) => {
            console.log(data)
            next(data);
          })
          .catch(error => {
            console.log(error.message)
            next(error);
          });
      } else {
        next();
      }

      // TODO: Get user permissions
      // TODO: Get projects filtered by magpieId
      // TODO: Add project permissions in a property
    } else {
      next();
    }
  });
};
