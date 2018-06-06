module.exports = {
  "name": "Sample Workflow 'Search Catalog & Subsetting'",
  "tasks": [{
    "name": "search",
    "provider": "catalog",
    "identifier": "pavicsearch",
    "inputs": {
      "query": "aet_pcp_1970",
      "constraints": "project:Ouranos",
      "type": "Aggregate"
    },
    "progress_range": [0, 10]
  },
    {
      "name": "subset",
      "provider": "flyingpigeon",
      "identifier": "subset",
      "linked_inputs": {
        "resource": {
          "task": "search",
          "output": "list_result"
        }
      },
      "inputs": {
        "typename": "opengeo:NE_State_and_Province_Boundaries",
        "featureids": ["NE_State_and_Province_Boundaries.4360"]
      },
      "progress_range": [10, 100]
    }]
};
