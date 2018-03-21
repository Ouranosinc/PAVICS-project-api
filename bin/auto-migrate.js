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
  'Workflow',
];
db.automigrate(lbTables, function(er) {
  if (er) {
    // throw er;
  }
  console.log('Auto-Migrated Following Loopback Tables [' + lbTables + '] created in ', db.adapter.name);
  createMockData();
  // db.disconnect();
});

function createMockData() {

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

  users.forEach(function (user) {
    app.models.Researcher.create(user, function (err, model) {
      if (err) throw err;
      console.log('Created Researcher:', model);

      projects.map((project, i) => {
        project.name = `${model.username} Project ${i+1}`;
        project.description = `This demo project is intended to allow users to launch complex workflows, visualize climatological datasets and workflow results of any kind. Everything will be public and visible to anybody.`;
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
