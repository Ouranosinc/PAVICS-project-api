module.exports = {
  "db": {
    "host": process.env.POSTGRES_HOST || "localhost",
    "port": 5432,
    "url": "",
    "database": process.env.POSTGRES_DB || "pavics",
    "password": process.env.POSTGRES_PASSWORD || "qwerty",
    "name": "db",
    "user": process.env.POSTGRES_USER || "pavics",
    "connector": "postgresql"
  },
  "magpie": {
    "name": "magpie",
    "baseURL": process.env.MAGPIE_HOST,
    "crud": true,
    "connector": "rest"
  }
};
