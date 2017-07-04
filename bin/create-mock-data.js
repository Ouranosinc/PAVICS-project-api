var path = require('path');

var app = require(path.resolve(__dirname, '../server/server'));
var db = app.datasources.db;
db.automigrate('User', function(err) {
  if (err) throw err;

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
  let count = users.length;
  let createdResearchers = []
  users.forEach(function(user) {
    app.models.Researcher.create(user, function(err, model) {
      if (err) throw err;
      createdResearchers.push(model);
      console.log('Created Researcher:', model);

      let projects = [
        {
          name: `project-${model.username}-1`,
          researcherId: model.id
        },
        {
          name: `project-${model.username}-2`,
          researcherId: model.id
        },
        {
          name: `project-${model.username}-3`,
          researcherId: model.id
        }
      ];
      var count = projects.length;
      projects.forEach(function(project) {
        app.models.Project.create(project, function(err, model) {
          if (err) throw err;

          console.log('Created Project:', model);

          count--;
          if (count === 0)
            db.disconnect();
        });
      });

      count--;
      if (count === 0)
        db.disconnect();
    });
  });
});
