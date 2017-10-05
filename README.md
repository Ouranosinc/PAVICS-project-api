# Launch PostgreSQL docker image
```
$ docker run -p 5432:5432 --name postgres -e POSTGRES_USER=pavics -e POSTGRES_DB=pavics -e POSTGRES_PASSWORD=qwerty -d postgres
$ export POSTGRES_HOST=1.1.1.1
```

You actually have to enter a valid ip/domain here, the one on which you presently are deploying.

# Install dependencies
```
$ npm install strongloop loopback-cli -g
$ npm install
```

# Create Postgres Tables and mock data

Make sure you actually ran the docker command before, the database must be running to accept this script.

```
$ node bin/auto-migrate.js
```

# Launch API
```
$ npm start
```

# Build and Launch API as docker image
```
$ docker build -t pavics/project-api .
$ docker run -p 3005:3005 -it pavics/project-management
```
