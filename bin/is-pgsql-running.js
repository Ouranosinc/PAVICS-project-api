'use strict';

const {Client} = require('pg');
let awaitingConnection = true;

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function checkConnection() {
  while (awaitingConnection) {
    try {
      const client = new Client({
        connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/${process.env.POSTGRES_DB}`
      });
      client.connect()
        .then(() => {
          console.log('connected');
          awaitingConnection = false;
          client.end();
        })
        .catch(err => {
          console.log(err);
        });
    }
    catch (ex) {
      console.log('there was an exception in the try catch: %o', ex);
    }
    await sleep(3000);
  }
}

checkConnection();
