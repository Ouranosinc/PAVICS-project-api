# Project-api

This is the repository that generates a loopback api to manage data relevant for the PAVICS frontend platform.

## About Deployment

This is intended to be deployed through the general docker-compose file of the platform (currently not public).

As such, when this docker image is launched, we can't be sure of either postgres being up, or that the database exists, or even if it contains the correct scheme for the current api.

## Launch PostgreSQL docker image
```
$ docker run -p 5432:5432 --name postgres -e POSTGRES_USER=<POSTGRES_USER> -e POSTGRES_DB=<POSTGRES_DB> -e POSTGRES_PASSWORD=<POSTGRES_PASSWORD> -d postgres
```

## Install dependencies and set needed environment variables
```
$ npm install
$ export BIRDHOUSE_HOST=outarde.crim.ca
$ export MAGPIE_HOST=https://outarde.crim.ca/magpie
$ export MAGPIE_PROJECT_SERVICE_TYPE=project-api
$ export MAGPIE_PROJECT_USER=<MAGPIE_PROJECT_USER>
$ export MAGPIE_PROJECT_PASSWORD=<MAGPIE_PROJECT_PASSWORD>
$ export POSTGRES_HOST=<LOCAL_IP>
$ export POSTGRES_DB=<POSTGRES_DB>
$ export POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
$ export POSTGRES_USER=<POSTGRES_USER>
```

## Launch API
```
$ npm start
```

## In development, use Loopback CLI to create templates
```
$ npm install loopback-cli -g
$ lb realation # Create a la relation, more examples here https://github.com/strongloop/loopback-cli
```

## Build and Launch API as docker image
```
$ docker build -t pavics/project-api .
$ docker run -p 3005:3005 -it pavics/project-api
```

### Getting the image up

We need to verify that postgres is up before launching the api. The is-pgsql-running script will freeze the node process and loop forever, trying to connect to the "postgres" default database. **We must make sure that this default database is created with the image, or that will freeze the api forever.** When that is done, the auto migration script will try to connect to the pavics database (at this point, we assume postgres is up).

- while the connection to the "postgres" database is not successful assume postgres is not up yet
  - try to connect to the default postgres database
- try to connect to the "pavics" database
- if "pavics" database is not found
  - create it with correct owner and charset
  - launch the auto migration scripts (we don't need to protect existing data, logically)
- else "pavics" database is found
  - run the auto-update functions of loopback to make sure the scheme is up to date with current model definitions

## Directly create Postgres Tables and mock data if needed

Make sure that postgres is running and environment variables are set

```
$ node bin/auto-migrate-db.js
```

