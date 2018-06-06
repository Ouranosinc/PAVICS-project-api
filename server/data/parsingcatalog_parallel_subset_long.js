module.exports = {
  "name": "Sample Workflow 'Parsing catalog & Parallel Subsetting (long)'",
  "tasks": [{
    "name": "ParsingCatalog",
    "provider": "malleefowl",
    "identifier": "thredds_urls",
    "inputs": {
      "url": `https://${process.env.BIRDHOUSE_HOST}/twitcher/ows/proxy/thredds/catalog/birdhouse/nrcan/nrcan_canada_daily/catalog.xml`
    },
    "progress_range": [0, 10]
  }],
  "parallel_groups": [{
    "name": "FlyGroup",
    "map": {
      "task": "ParsingCatalog",
      "output": "output",
      "as_reference": false
    },
    "reduce": {
      "task": "Subsetting",
      "output": "output",
      "as_reference": true
    },
    "max_processes": 4,
    "tasks": [{
      "name": "Subsetting",
      "provider": "flyingpigeon",
      "identifier": "subset_WFS",
      "inputs": {
        "typename": "opengeo:NE_State_and_Province_Boundaries",
        "featureids": "NE_State_and_Province_Boundaries.564",
        "mosaic": "False"
      },
      "linked_inputs": {
        "resource": {
          "task": "FlyGroup"
        }
      },
      "progress_range": [10, 100]
    }]
  }]
};
