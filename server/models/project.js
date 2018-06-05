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

  Project.projectsByMagpieAccess = async () => {
    // Sadly, Http request (ctx.req) object does not exists in Loopback 3
    // The only way to actually extract cookies from request is by using loopback-context method
    let lbContext = LoopBackContext.getCurrentContext();
    let userToken = lbContext.get('currentToken');
    console.log(`Token: ${userToken}`);

    if(userToken && userToken.length) {
      console.log('There\'s a token in the request');
      try {
        let user = await magpie.session(userToken);
        let resources = await magpie.getUserResources(user.user_name);
        // console.log(resources);
        let magpieIds = resources.map(x => x.resource_id);
        // console.log(magpieIds);
        let result = await Project.find({
          where: {
            magpieId: {
              inq: magpieIds
            }
          }
        });
        // console.log(result);
        return Promise.resolve(result);
      }catch(error) {
        return Promise.reject(error);
      }
    } else {
      return Promise.resolve([]);
    }
  };

  Project.remoteMethod('projectsByMagpieAccess', {
    accepts: [],
    returns: {arg: 'projects', type: 'array'},
    http: {path: '/projectsByMagpieAccess', verb: 'get'}
  });

  Project.observe('after save', async (ctx) => {
    console.log('After saving a project hook');
    // console.log(ctx.http.req)

    if (ctx.instance) {
      // use ctx.instance
      console.log('After creating a project hook');

      if(!ctx.instance.magpieId) {
        try {
          let resource = await magpie.tempRegisterResource(ctx.instance.id);
          let readPermission = await magpie.addResourcePermission(resource.resource_id, ctx.instance.owner, 'read');
          let writePermission = await magpie.addResourcePermission(resource.resource_id, ctx.instance.owner, 'write');
          let newProject = await ctx.instance.updateAttribute('magpieId', resource.resource_id);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      } else {
        return Promise.resolve();
      }
    } else {
      // use ctx.data
      console.log('After updating a project hook');
      if (!ctx.data.magpieId) {
        console.warn(`Warning: No magpieId property defined for project with id ${ctx.data.id}`);
      }
      return Promise.resolve();
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
};
