var path = require('path');

var app = require(path.resolve(__dirname, '../server/server'));
var db = app.datasources.db;

var lbTables = [
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
  'Workflow'
];
db.automigrate(lbTables, function(er) {
  if (er) // throw er;
  console.log('Auto-Migrated Following Loopback Tables [' + lbTables + '] created in ', db.adapter.name);
  createMockData();
  // db.disconnect();
});

function createMockData() {

  var users = [
    {
      email: 'renaud.hebert-legault@crim.ca',
      username: 'renaud',
      password: 'qwerty',
      createdAt: new Date(),
      lastModifiedAt: new Date()
    },
    {
      email: 'felix.gagnon-grenier@crim.ca',
      username: 'fractal',
      password: 'qwerty',
      createdAt: new Date(),
      lastModifiedAt: new Date()
    }
  ];
  var workflows = [
    {"name":"hirondelle-workflow-defaults_demo_1","json":{"name":"hirondelle-workflow-defaults_demo_1","tasks":[{"name":"Downloading","identifier":"thredds_download","inputs":{"url":"http://hirondelle.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/rcp85/day/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"True"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name":"pluvier-workflow_defaults_demo_1","json":{"name":"pluvier-workflow_defaults_demo_1","tasks":[{"name":"Downloading","url":"http://pluvier.crim.ca:8091/wps","identifier":"thredds_download","inputs":{"url":"http://pluvier.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://pluvier.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://pluvier.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name":"outarde-workflow_defaults_demo_1","json":{"name":"outarde-workflow_defaults_demo_1","tasks":[{"name":"Downloading","url":"http://outarde.crim.ca:8091/wps","identifier":"thredds_download","inputs":{"url":"http://outarde.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://outarde.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://outarde.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}}
  ];
  let projects = [{}, {}, {}];
  let count = users.length * projects.length * workflows.length ;

  users.forEach(function (user) {
    app.models.Researcher.create(user, function (err, model) {
      if (err) throw err;
      console.log('Created Researcher:', model);

      projects.map((project, i) => {
        project.name = `project-${model.username}-${i+1}`;
        project.researcherId = model.id;
      });

      projects.forEach(function (project) {
        app.models.Project.create(project, function (err, model) {
          if (err) throw err;

          console.log('Created Project:', model);
          workflows.map((workflow) => workflow.projectId = model.id);

          workflows.forEach(function (workflow) {
            app.models.Workflow.create(workflow, function (err, model) {
              if (err) throw err;
              console.log('Created Workflow:', model);

              count--;
              if (count === 0)
                db.disconnect();
            });
          });


        });
      });

    });
  });
}
