var path = require('path');

var app = require(path.resolve(__dirname, '../server/server'));
var db = app.datasources.db;
db.automigrate('User', function(err) {
  if (err) throw err;

  var users = [
    {
      email: 'renaud.hebert-legault@crim.ca',
      username: 'Renaud0009',
      password: 'qwerty',
      createdAt: new Date(),
      lastModifiedAt: new Date()
    },
    {
      email: 'felix.gagnon-grenier@crim.ca',
      username: 'Fractal',
      password: 'qwerty',
      createdAt: new Date(),
      lastModifiedAt: new Date()
    }
  ];
  var count = users.length;
  users.forEach(function(user) {
    app.models.User.create(user, function(err, model) {
      if (err) throw err;

      console.log('Created User:', model);

      count--;
      if (count === 0)
        db.disconnect();
    });
  });
});

db.automigrate('Project', function(err) {
  if (err) throw err;

  var projects = [
    {
      name: 'project-test-1'
    },
    {
      name: 'project-test-2'
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
});
