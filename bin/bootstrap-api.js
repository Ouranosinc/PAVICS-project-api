'use strict';

const path = require('path');
const {Client} = require('pg');
const lbTables = [
  // Built-in
  'User',
  'AccessToken',
  'ACL',
  'RoleMapping',
  'Role',
  // Custom
  'Dataset',
  'Job',
  'Project',
  'Research',
  'Researcher',
  'Task',
  'Workflow',
];
let awaitingConnection = true;
let db;
let app;
let postgresClient;
let pavicsClient;

checkConnection();

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function checkConnection() {

  // first we wait for postgres image to be up
  while (awaitingConnection) {
    try {
      const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/postgres`;
      postgresClient = new Client({
        connectionString: connectionString,
      });
      await postgresClient.connect();
      awaitingConnection = false;
      console.log('postgresql is up');
    }
    catch (ex) {
      console.log('postgres is not up: %s', ex.message);
    }
    await sleep(3000);
  }

  // if we get here postgresClient should be a valid postgres default client
  // let's verify if the pavics database exists already

  try {
    const pavicsDbConnectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`;
    pavicsClient = new Client({
      connectionString: pavicsDbConnectionString,
    });
    await pavicsClient.connect();
    console.log('pavics database already exists, we should auto update');
    app = require(path.resolve(__dirname, '../server/server'));
    db = app.datasources.db;
    db.autoupdate(lbTables, function(er) {
      if (er) {
        // throw er;
      }
    });
  } catch (ex) {
    console.log('pavics client does not exist, we should create everything from scratch');
    try {
      await initializePavicsDatabase(postgresClient);
      app = require(path.resolve(__dirname, '../server/server'));
      db = app.datasources.db;
      db.automigrate(lbTables, function(er) {
        if (er) {
          // throw er;
        }
        console.log('Auto-Migrated Following Loopback Tables [' + lbTables + '] created in ', db.adapter.name);
        createMockData(db);
        // db.disconnect();
      });
    } catch (ex) {
      console.log('we could not initialize pavics database: %s', ex.message);
    }
  }

  await postgresClient.end();
  await pavicsClient.end();
}

const initializePavicsDatabase = (client) => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE DATABASE ${process.env.POSTGRES_DB}
      OWNER = ${process.env.POSTGRES_USER}
      ENCODING = UTF8
    `;
    client.query(sql, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

};

const createMockData = db => {
  const users = [
    {
      email: 'demo@crim.ca',
      username: 'Demo',
      password: 'demo',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    },
  ];
  const workflows = [
    {"name": "Workflow simple (Pluvier default values)","json":{"name":"Workflow simple (Pluvier default values)","tasks":[{"name":"Downloading","url":"http://pluvier.crim.ca:8091/wps","identifier":"thredds_urls","inputs":{"url":"https://pluvier.crim.ca/twitcher/ows/proxy/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://pluvier.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://pluvier.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name": "Workflow with parallel tasks that will fail (Pluvier default values)","json":{"name":"Workflow with parallel tasks that will fail (Pluvier default values)","tasks":[{"provider":"malleefowl","inputs":{"url":"https://pluvier.crim.ca/twitcher/ows/proxy/thredds/catalog/birdhouse/ouranos/subdaily/aet/pcp/catalog.xml"},"identifier":"thredds_urls","name":"ParsingCatalog","progress_range":[0,10]},{"provider":"catalog","linked_inputs":{"target_files":{"task":"FlyGroup"}},"identifier":"pavicrawler","name":"Indexing","progress_range":[80,100]}],"parallel_groups":[{"map":{"output":"output","as_reference":false,"task":"ParsingCatalog"},"tasks":[{"inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"name":"Subsetting","provider":"flyingpigeon","linked_inputs":{"resource":{"task":"FlyGroup"}},"identifier":"subset_WFS","progress_range":[10,60]},{"linked_inputs":{"resource":{"output":"output","as_reference":true,"task":"Subsetting"}},"inputs":{"location":"/workspaces/current_user/{model}/{initial_year}"},"identifier":"persist","name":"Persisting","progress_range":[60,80],"provider":"malleefowl"}],"reduce":{"output":"output","as_reference":true,"task":"Persisting"},"name":"FlyGroup","max_processes":3}]}},
    {"name": "Workflow complete (Pluvier default values)","json":{"name":"Workflow complete (Pluvier default values)","tasks":[{"provider":"malleefowl","inputs":{"url":"https://pluvier.crim.ca/twitcher/ows/proxy/thredds/catalog/birdhouse/nrcan/nrcan_canada_daily/catalog.html"},"identifier":"thredds_urls","name":"ParsingCatalog","progress_range":[0,10]}],"parallel_groups":[{"map":{"output":"output","as_reference":false,"task":"ParsingCatalog"},"tasks":[{"inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"name":"Subsetting","provider":"flyingpigeon","linked_inputs":{"resource":{"task":"FlyGroup"}},"identifier":"subset_WFS","progress_range":[10,60]},{"inputs":{"default_facets":"{\"var\":\"pr\"}","location":"/workspaces/david/{model}/{var}/{frequency}/{initial_year}"},"name":"Persisting","provider":"malleefowl","linked_inputs":{"resource":{"output":"output","as_reference":true,"task":"Subsetting"}},"identifier":"persist","progress_range":[60,80]},{"provider":"catalog","linked_inputs":{"target_files":{"output":"output","as_reference":true,"task":"Persisting"}},"identifier":"pavicrawler","name":"Indexing","progress_range":[80,100]}],"reduce":{"output":"crawler_result","as_reference":false,"task":"Indexing"},"name":"FlyGroup","max_processes":3}]}},
    {"name": "Workflow simple (Outarde default values)","json":{"name":"Workflow simple (Outarde default values)","tasks":[{"name":"Downloading","url":"http://outarde.crim.ca:8091/wps","identifier":"thredds_urls","inputs":{"url":"https://outarde.crim.ca/twitcher/ows/proxy/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://outarde.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://outarde.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name": "Workflow simple (Hirondelle default values)","json":{"name":"Workflow simple (Hirondelle default values)","tasks":[{"name":"Downloading","identifier":"thredds_urls","inputs":{"url":"https://hirondelle.crim.ca/twitcher/ows/proxy/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/rcp85/day/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"True"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}}
  ];
  const projects = [{}, {}, {}];
  let count = users.length * projects.length * workflows.length;

  users.forEach(function(user) {
    app.models.Researcher.create(user, function(err, model) {
      if (err) {
        throw err;
      }

      projects.map((project, i) => {
        project.name = `${model.username} Project ${i + 1}`;
        project.description = 'This demo project is intended to allow users to launch complex workflows, visualize climatological datasets and workflow results of any kind. Everything will be public and visible to anybody.';
        project.researcherId = model.id;
      });

      projects.forEach(function(project) {
        app.models.Project.create(project, function(err, model) {
          if (err) {
            throw err;
          }

          workflows.map((workflow) => workflow.projectId = model.id);

          workflows.forEach(function(workflow) {
            app.models.Workflow.create(workflow, function(err, model) {
              if (err) {
                throw err;
              }

              count--;
              if (count === 0) {
                db.disconnect();
              }
            });
          });
        });
      });
    });
  });
};
