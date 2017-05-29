# Launch PostgreSQL docker image
```
$ docker run -p 5432:5432 --name postgres -e POSTGRES_USER=pavics -e POSTGRES_DB=pavics -e POSTGRES_PASSWORD=qwerty -d postgres
```

# Install dependencies
```
$ npm install strongloop loopback-cli -g
$ npm install
```

# Create Postgres Tables and mock data
```
# Edit server/datasources.json configuration first
$ node bin/create-postgres-tables.js
$ node bin/create-mock-data.js
```

# Launch API
```
$ slc run
```

# Build and Launch API as docker image
```
$ docker build -t pavics/project-management .
$ docker run -p 3005:3005 -it pavics/project-management
```
