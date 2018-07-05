'use strict';

const path = require('path');
const {Client} = require('pg');
let createMockData = require('./create-mock-data').createMockData;
let lbTables = require('./lb-tables').lbTables;
let app = require(path.resolve(__dirname, '../server/server'));
let db = app.datasources.db;
let awaitingConnection = true;
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
    console.log(`${process.env.POSTGRES_DB} database already exists, we should auto update`);
    db.autoupdate(lbTables, function(er) {
      if (er) {
        // throw er;
      }
    });
  } catch (ex) {
    console.log(`${process.env.POSTGRES_DB} database does not exist, we should create everything from scratch`);
    try {
      await initializePavicsDatabase(postgresClient);
      db.automigrate(lbTables, function(er) {
        if (er) {
          // throw er;
        }
        console.log('Auto-Migrated Following Loopback Tables [' + lbTables + ']');
        // There's no need to create mock data anymore since user management is now entirely delegated to magpie
        // createMockData();
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
