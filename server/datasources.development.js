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
  }/*,
  "magpie": {
    "name": "magpie",
    "baseURL": process.env.MAGPIE_HOST,
    "crud": false,
    "connector": "rest",
    "options": {
      "headers": {
        "accept": "application/json",
        "content-type": "application/json"
      },
      "strictSSL": true
    },
    "operations": [
      {
        "template": {
          "method": "GET",
          "url": `${process.env.MAGPIE_HOST}/services/{service_name=projects/resources`
        },
        "options": {
          "headers": {
            'cookie': 'auth_tkt=ad822b1dd11905125c473636c0ea5b21150847b24d39d27535ff658de74e8aeeb8e71e7e5cc063e73af5fe15bc03265fcd7f62474539dae552a2fcd2092354385b101c5a10!userid_type:int'
          }
        },
        "functions": {
          "getResources": ["service_name"]
        }
      },*/
      /*{
        "template": {
          "method": "POST",
          "url": `${process.env.MAGPIE_HOST}/services/{service_name=projects}/resources`,
          "body": {
            "resource_name": "{resource_name}",
            "resource_type": "{resource_type}"
          }
        },
        "functions": {
          "registerResource": ["resource_name", "resource_type", "service_name"]
        }
      },*/
      /*{
        "template": {
          "method": "DELETE",
          "url": `${process.env.MAGPIE_HOST}/resources/{resource_id}`
        },
        "functions": {
          "deleteResource": ["resource_id"]
        }
      }
    ]
  }*/
};
