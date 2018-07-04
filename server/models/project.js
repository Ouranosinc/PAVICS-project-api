'use strict';
const magpie = require('./../magpie');
const LoopBackContext = require('loopback-context');
const app = require('../../server/server');
const parsingCatalogParallelSubsetLongWorkflow = require('../data/parsingcatalog_parallel_subset_long');
const parsingCatalogParallelSubsetSmallWorkflow = require('../data/parsingcatalog_parallel_subset_small');
const searchSubsetWorkflow = require('../data/search_subset');
const searchSubsetComputeWorkflow = require('../data/search_subset_compute');

module.exports = function(Project) {

  // Should be behind Twitcher (who validates token and permissions)
  Project.shareToUser = async (projectId, user, readPermission, writePermission) => {
    const project = await Project.findOne({where: {id: projectId}});
    if(project) {
      // Two try/catch since first could fail with "409/500 (Conflicts)"  while we still want to try to process the other
      try {
        if (readPermission) {
          await magpie.addResourcePermission(project.magpieId, user, 'read');
        }
      }catch(error) {
        console.error(error);
        // Promise.reject(error);
      }
      try {
        if (writePermission) {
          await magpie.addResourcePermission(project.magpieId, user, 'write');
        }
      }catch(error) {
        console.error(error);
        // Promise.reject(error);
      }
    }else {
      console.log(`Project with id ${projectId} could not be found, no attempt to add permission in magpie was made`)
    }

    // Designed to always return 200 even if the user name doesn't exists
    Promise.resolve(projectId)
  };

  Project.remoteMethod('shareToUser', {
    accepts: [
      {arg: 'id', type: 'number', required: true},
      {arg: 'user', type: 'string', required: true},
      {arg: 'readPermission', type: 'boolean', required: true},
      {arg: 'writePermission', type: 'boolean', required: true}
    ],
    returns: {arg: 'id', type: 'string'},
    http: {path: '/:id/shareToUser', verb: 'post'}
  });

  // Should be behind Twitcher (who validates token and permissions)
  // Designed to always return 200 even if the group name doesn't exists
  Project.shareToGroup = async (projectId, group, readPermission, writePermission, cb) => {
    let project, users;
    try {
      const lbContext = LoopBackContext.getCurrentContext();
      const userToken = lbContext.get('currentToken');
      const currentUserGroups = await magpie.getCurrentUserGroups(userToken);
      if(currentUserGroups.includes(group)) {

      }
      // TODO: validate token to make sure user is part of specified group
      users = await magpie.getGroupUsers(group);
      console.log(users);
      project = await Project.findOne({where: {id: projectId}});
    }catch(error) {
      console.error(error);
    }

    if(users && project) {
      // Using synchronous for loop to use async/await
      for(let user of users) {
        // Two try/catch since first could fail with "409/500 (Conflicts)" while we still want to try to process the other
        try {
          if (readPermission) {
            await magpie.addResourcePermission(project.magpieId, user, 'read');
          }
        }catch(error) {
          console.error(error);
        }
        try {
          if (writePermission) {
            await magpie.addResourcePermission(project.magpieId, user, 'write');
          }
        }catch(error) {
          console.error(error);
        }
      }
    }

    // Designed to always return 200 even if the user name doesn't exists
    Promise.resolve(projectId)
  };

  Project.remoteMethod('shareToGroup', {
    accepts: [
      {arg: 'id', type: 'number', required: true},
      {arg: 'group', type: 'string', required: true},
      {arg: 'readPermission', type: 'boolean', required: true},
      {arg: 'writePermission', type: 'boolean', required: true}
    ],
    returns: {arg: 'id', type: 'string'},
    http: {path: '/:id/shareToGroup', verb: 'post'}
  });

  Project.observe('access', function logQuery(ctx, next) {
    // TODO add permissions array to the project(s)
    console.log('Accessing %s matching %o', ctx.Model.modelName, ctx.query.where);
    next();
  });

  // ** This method is publicly exposed **
  Project.projectsByMagpieAccess = async () => {
    // Sadly, Http request (ctx.req) object does not exists in Loopback 3
    // The only way to actually extract cookies from request is by using loopback-context method which involve a middleware (middleware.json)
    let lbContext = LoopBackContext.getCurrentContext();
    let userToken = lbContext.get('currentToken');
    // console.log(`Token: ${userToken}`);

    if(userToken && userToken.length) {
      console.log('There\'s a token in the projectsByMagpieAccess request');
      try {
        // Validate token and define username
        let user = await magpie.session(userToken);

        // Get user resource (filtered by project-api by default)
        let resources = await magpie.getUserResources(user.user_name);
        // console.log(resources);

        // Build an array of magpie ids
        let magpieIds = resources.map(x => x.resource_id);
        // console.log(magpieIds);

        // Fetch all projects that match one of magpieIds elements, then return the result
        let projects = await Project.find({
          where: {
            magpieId: {
              inq: magpieIds
            }
          }
        });
        projects.map(p => p.permissions = resources.find(r => r.resource_id === p.magpieId).permission_names.sort());
        return Promise.resolve(projects);
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

  /*async function createSampleWorkflows (project) {

  }*/

  // TODO: Should be behind Twitcher (who validate token and permissions)
  Project.observe('after save', async (ctx) => {
    // console.log('After saving a project hook');

    if (ctx.instance) {
      // use ctx.instance
      // console.log('After creating/editing a project hook');

      if(!ctx.instance.magpieId) {
        // console.log('After creating a project hook (magpieId undefined');
        try {
          let sampleWorkflows = [
            {
              projectId: ctx.instance.id,
              name: parsingCatalogParallelSubsetLongWorkflow.name,
              json: parsingCatalogParallelSubsetLongWorkflow
            },
            {
              projectId: ctx.instance.id,
              name: parsingCatalogParallelSubsetSmallWorkflow.name,
              json: parsingCatalogParallelSubsetSmallWorkflow
            },
            {
              projectId: ctx.instance.id,
              name: searchSubsetWorkflow.name,
              json: searchSubsetWorkflow
            },
            {
              projectId: ctx.instance.id,
              name: searchSubsetComputeWorkflow.name,
              json: searchSubsetComputeWorkflow
            }
          ];

          // Create sample workflows
          console.log('Creating sample workflows');
          await app.models.Workflow.create(sampleWorkflows[0]);
          await app.models.Workflow.create(sampleWorkflows[1]);
          await app.models.Workflow.create(sampleWorkflows[2]);
          await app.models.Workflow.create(sampleWorkflows[3]);

          // Register new resource and owner resource permissions in magpie
          const resource = await magpie.registerResource(ctx.instance.id);
          console.log(resource);
          await magpie.addResourcePermission(resource.resource_id, ctx.instance.owner, 'read');
          await magpie.addResourcePermission(resource.resource_id, ctx.instance.owner, 'write');

          // Update magpie resource id in project database
          await ctx.instance.updateAttribute('magpieId', resource.resource_id);

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

  // TODO: Should be behind Twitcher (who validate token and permissions)
  Project.observe('before delete', async (ctx) => {
    console.log('Before deleting a project hook');

    if (ctx.instance) {
      console.log('Delete instance....');
      return Promise.resolve();
    } else {
      console.log('Delete with no instance....');
      console.log(`Project with id ${ctx.where.id} is about to be deleted`);
      try {
        const project = await Project.findOne({where: {id: ctx.where.id}});
        console.log(project);
        await magpie.deleteResource(project.magpieId);
        return Promise.resolve();
      } catch(error) {
        return Promise.reject(error);
      }
    }
  });
};
