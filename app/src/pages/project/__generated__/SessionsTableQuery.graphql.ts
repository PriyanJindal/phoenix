/**
 * @generated SignedSource<<178451515ca7af64a4e6fbc1966e3b42>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TimeRange = {
  end: string;
  start: string;
};
export type SessionsTableQuery$variables = {
  after?: string | null;
  filterIoSubstring?: string | null;
  first?: number | null;
  id: string;
  timeRange?: TimeRange | null;
};
export type SessionsTableQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionsTable_sessions">;
  };
};
export type SessionsTableQuery = {
  response: SessionsTableQuery$data;
  variables: SessionsTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filterIoSubstring"
},
v2 = {
  "defaultValue": 50,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "timeRange"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = {
  "kind": "Variable",
  "name": "after",
  "variableName": "after"
},
v7 = {
  "kind": "Variable",
  "name": "filterIoSubstring",
  "variableName": "filterIoSubstring"
},
v8 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = [
  (v6/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/),
  {
    "kind": "Variable",
    "name": "timeRange",
    "variableName": "timeRange"
  }
],
v12 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionsTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/)
            ],
            "kind": "FragmentSpread",
            "name": "SessionsTable_sessions"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionsTableQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          },
          (v10/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v11/*: any*/),
                "concreteType": "ProjectSessionConnection",
                "kind": "LinkedField",
                "name": "sessions",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectSessionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": "session",
                        "args": null,
                        "concreteType": "ProjectSession",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v10/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "sessionId",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "numTraces",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startTime",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "endTime",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SpanIOValue",
                            "kind": "LinkedField",
                            "name": "firstInput",
                            "plural": false,
                            "selections": (v12/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "SpanIOValue",
                            "kind": "LinkedField",
                            "name": "lastOutput",
                            "plural": false,
                            "selections": (v12/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TokenUsage",
                            "kind": "LinkedField",
                            "name": "tokenUsage",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "prompt",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "completion",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "total",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ProjectSession",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PageInfo",
                    "kind": "LinkedField",
                    "name": "pageInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endCursor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasNextPage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v11/*: any*/),
                "filters": [
                  "filterIoSubstring",
                  "timeRange"
                ],
                "handle": "connection",
                "key": "SessionsTable_sessions",
                "kind": "LinkedHandle",
                "name": "sessions"
              }
            ],
            "type": "Project",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4e6b96fbbfa7034e3501289566bc20d9",
    "id": null,
    "metadata": {},
    "name": "SessionsTableQuery",
    "operationKind": "query",
    "text": "query SessionsTableQuery(\n  $after: String = null\n  $filterIoSubstring: String = null\n  $first: Int = 50\n  $timeRange: TimeRange\n  $id: GlobalID!\n) {\n  node(id: $id) {\n    __typename\n    ...SessionsTable_sessions_zrmri\n    __isNode: __typename\n    id\n  }\n}\n\nfragment SessionsTable_sessions_zrmri on Project {\n  name\n  sessions(first: $first, after: $after, filterIoSubstring: $filterIoSubstring, timeRange: $timeRange) {\n    edges {\n      session: node {\n        id\n        sessionId\n        numTraces\n        startTime\n        endTime\n        firstInput {\n          value\n        }\n        lastOutput {\n          value\n        }\n        tokenUsage {\n          prompt\n          completion\n          total\n        }\n      }\n      cursor\n      node {\n        __typename\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n"
  }
};
})();

(node as any).hash = "e846bbacd897b12db7c1b5410055f394";

export default node;
