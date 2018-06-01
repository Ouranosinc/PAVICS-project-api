var path = require('path');
var app = require(path.resolve(__dirname, '../server/server'));
var db = app.datasources.db;

function createMockData() {
  var workflows = [
    {"name":"hirondelle-workflow_simple_demo","json":{"name":"hirondelle-workflow_simple_demo","tasks":[{"name":"Downloading","identifier":"thredds_download","inputs":{"url":"http://hirondelle.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/rcp85/day/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"True"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name":"pluvier-workflow_simple_demo","json":{"name":"pluvier-workflow_simple_demo","tasks":[{"name":"Downloading","url":"http://pluvier.crim.ca:8091/wps","identifier":"thredds_download","inputs":{"url":"http://pluvier.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://pluvier.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://pluvier.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}},
    {"name":"pluvier-workflow_parallel_tasks_demo","json":{"name":"pluvier-workflow_parallel_tasks_demo","tasks":[{"provider":"malleefowl","inputs":{"url":"http://pluvier.crim.ca:8083/thredds/catalog/birdhouse/ouranos/subdaily/aet/pcp/catalog.xml"},"identifier":"thredds_urls","name":"ParsingCatalog","progress_range":[0,10]},{"provider":"catalog","linked_inputs":{"target_files":{"task":"FlyGroup"}},"identifier":"pavicrawler","name":"Indexing","progress_range":[80,100]}],"parallel_groups":[{"map":{"output":"output","as_reference":false,"task":"ParsingCatalog"},"tasks":[{"inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"name":"Subsetting","provider":"flyingpigeon","linked_inputs":{"resource":{"task":"FlyGroup"}},"identifier":"subset_WFS","progress_range":[10,60]},{"provider":"malleefowl","linked_inputs":{"resource":{"output":"output","as_reference":true,"task":"Subsetting"}},"identifier":"download","name":"Uploading","progress_range":[60,80]}],"reduce":{"output":"output","as_reference":true,"task":"Uploading"},"name":"FlyGroup","max_processes":3}]}},
    {"name":"pluvier-workflow_complete_demo","json":{"tasks":[{"provider":"malleefowl","inputs":{"url":"http://pluvier.crim.ca:8083/thredds/catalog/birdhouse/nrcan/nrcan_canada_daily/catalog.html"},"identifier":"thredds_urls","name":"ParsingCatalog","progress_range":[0,10]}],"name":"pluvier-workflow_complete_demo","parallel_groups":[{"map":{"output":"output","as_reference":false,"task":"ParsingCatalog"},"tasks":[{"inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"name":"Subsetting","provider":"flyingpigeon","linked_inputs":{"resource":{"task":"FlyGroup"}},"identifier":"subset_WFS","progress_range":[10,60]},{"inputs":{"default_facets":"{\"var\":\"pr\"}","location":"/workspaces/david/{model}/{var}/{frequency}/{initial_year}"},"name":"Persisting","provider":"malleefowl","linked_inputs":{"resource":{"output":"output","as_reference":true,"task":"Subsetting"}},"identifier":"persist","progress_range":[60,80]},{"provider":"catalog","linked_inputs":{"target_files":{"output":"output","as_reference":true,"task":"Persisting"}},"identifier":"pavicrawler","name":"Indexing","progress_range":[80,100]}],"reduce":{"output":"crawler_result","as_reference":false,"task":"Indexing"},"name":"FlyGroup","max_processes":3}]}},
    {"name":"outarde-workflow_simple_demo","json":{"name":"outarde-workflow_simple_demo","tasks":[{"name":"Downloading","url":"http://outarde.crim.ca:8091/wps","identifier":"thredds_download","inputs":{"url":"http://outarde.crim.ca:8083/thredds/catalog/birdhouse/CMIP5/CCCMA/CanESM2/historical/mon/atmos/r1i1p1/pr/catalog.xml"},"progress_range":[0,40],"provider":"malleefowl"}],"parallel_groups":[{"name":"SubsetterGroup","max_processes":2,"map":{"task":"Downloading","output":"output","as_reference":false},"reduce":{"task":"Indexing","output":"crawler_result","as_reference":false},"tasks":[{"name":"Subsetting","url":"http://outarde.crim.ca:8093/wps","identifier":"subset_WFS","inputs":{"typename":"ADMINBOUNDARIES:canada_admin_boundaries","featureids":"canada_admin_boundaries.5","mosaic":"False"},"linked_inputs":{"resource":{"task":"SubsetterGroup"}},"progress_range":[40,80],"provider":"flyingpigeon"},{"name":"Indexing","url":"http://outarde.crim.ca:8086/pywps","identifier":"pavicrawler","linked_inputs":{"target_files":{"task":"Subsetting","output":"output","as_reference":true}},"progress_range":[80,100],"provider":"catalog"}]}]}}
  ];
  let projects = [{}, {}, {}];
  let count = 1;

  projects.map((project, i) => {
    project.owner = 'renaud';
    project.name = `project-demo-${i+1}`;
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
}
exports.createMockData = createMockData;
