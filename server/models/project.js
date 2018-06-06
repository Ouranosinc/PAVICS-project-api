'use strict';
const magpie = require('./../magpie');
const LoopBackContext = require('loopback-context');
const app = require('../../server/server');
const parsingCatalogParallelSubsetLongWorkflow = require('../data/parsingcatalog_parallel_subset_long');
const parsingCatalogParallelSubsetSmallWorkflow = require('../data/parsingcatalog_parallel_subset_small');
const searchSubsetWorkflow = require('../data/search_subset');
const searchSubsetComputeWorkflow = require('../data/search_subset_compute');

module.exports = function(Project) {
  // TODO: Should be behind Twitcher (who validate token and permissions)
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
        let result = await Project.find({
          where: {
            magpieId: {
              inq: magpieIds
            }
          }
        });
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

  /*async function createSampleWorkflows (project) {

  }*/

  // TODO: Should be behind Twitcher (who validate token and permissions)
  Project.observe('after save', async (ctx) => {
    console.log('After saving a project hook');

    if (ctx.instance) {
      // use ctx.instance
      console.log('After creating a project hook');

      if(!ctx.instance.magpieId) {
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
          await app.models.Workflow.create(sampleWorkflows[0]);
          await app.models.Workflow.create(sampleWorkflows[1]);
          await app.models.Workflow.create(sampleWorkflows[2]);
          await app.models.Workflow.create(sampleWorkflows[3]);

          // Register new resource and owner resource permissions in magpie
          const resource = await magpie.tempRegisterResource(ctx.instance.id);
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
        await magpie.deleteResource(project.magpieId);
        return Promise.resolve();
      } catch(error) {
        return Promise.reject(error);
      }
    }
  });
};
