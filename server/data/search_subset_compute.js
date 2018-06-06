module.exports = {
  "name": "Sample Workflow 'Search, Subsetting & Compute'",
  "tasks": [
    {
      "name": "search",
      "provider": "catalog",
      "identifier": "pavicsearch",
      "inputs": {
        "constraints": "project:ClimEx,frequency:day,variable:tasmin",
        "type": "File",
        "limit": "10"
      }
    },
    {
      "name": "subset",
      "provider": "flyingpigeon",
      "identifier": "averager_WFS",
      "linked_inputs": {
        "resource": {
          "task": "search",
          "output": "list_result"
        }
      },
      "inputs": {
        "typename": "TravisTest:region_admin_poly",
        "featureids": [
          "region_admin_poly.4"
        ]
      }
    },
    {
      "name": "Climate indicator",
      "provider": "flyingpigeon",
      "identifier": "wps_c4i_simple_indice",
      "linked_inputs": {
        "resource": {
          "task": "subset",
          "output": "output"
        }
      },
      "inputs": {
        "indiceName": "TR"
      }
    }
  ]
};
