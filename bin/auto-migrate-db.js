var path = require('path');
var app = require(path.resolve(__dirname, '../server/server'));
var db = app.datasources.db;
var createMockData = require('./create-mock-data').createMockData;
var lbTables = require('./lb-tables').lbTables;

db.automigrate(lbTables, function(er) {
  if (er) // throw er;
    console.log('Auto-Migrated Following Loopback Tables [' + lbTables + '] created in ', db.adapter.name);
  // There's no need to create mock data anymore since user management is now entirely delegated to magpie
  // createMockData(app, db);
  // db.disconnect();
});
