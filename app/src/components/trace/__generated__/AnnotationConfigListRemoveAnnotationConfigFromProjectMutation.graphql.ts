/**
 * @generated SignedSource<<dcb4ed2eca59c5920f15c26de0a5c60b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AnnotationConfigListRemoveAnnotationConfigFromProjectMutation$variables = {
  annotationConfigId: string;
  filterUserIds?: ReadonlyArray<string> | null;
  projectId: string;
  spanId: string;
};
export type AnnotationConfigListRemoveAnnotationConfigFromProjectMutation$data = {
  readonly removeAnnotationConfigFromProject: {
    readonly query: {
      readonly node: {
        readonly id?: string;
        readonly " $fragmentSpreads": FragmentRefs<"SpanAnnotationsEditor_spanAnnotations">;
      };
      readonly projectNode: {
        readonly id?: string;
        readonly " $fragmentSpreads": FragmentRefs<"AnnotationConfigListProjectAnnotationConfigFragment">;
      };
    };
  };
};
export type AnnotationConfigListRemoveAnnotationConfigFromProjectMutation = {
  response: AnnotationConfigListRemoveAnnotationConfigFromProjectMutation$data;
  variables: AnnotationConfigListRemoveAnnotationConfigFromProjectMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "annotationConfigId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filterUserIds"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "spanId"
},
v4 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "annotationConfigId",
        "variableName": "annotationConfigId"
      },
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "projectId"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "spanId"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isNode"
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "score",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AnnotationConfigListRemoveAnnotationConfigFromProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RemoveAnnotationConfigFromProjectPayload",
        "kind": "LinkedField",
        "name": "removeAnnotationConfigFromProject",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Query",
            "kind": "LinkedField",
            "name": "query",
            "plural": false,
            "selections": [
              {
                "alias": "projectNode",
                "args": (v5/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "AnnotationConfigListProjectAnnotationConfigFragment"
                      }
                    ],
                    "type": "Project",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v6/*: any*/),
                      {
                        "args": [
                          {
                            "kind": "Variable",
                            "name": "filterUserIds",
                            "variableName": "filterUserIds"
                          }
                        ],
                        "kind": "FragmentSpread",
                        "name": "SpanAnnotationsEditor_spanAnnotations"
                      }
                    ],
                    "type": "Span",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "AnnotationConfigListRemoveAnnotationConfigFromProjectMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RemoveAnnotationConfigFromProjectPayload",
        "kind": "LinkedField",
        "name": "removeAnnotationConfigFromProject",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Query",
            "kind": "LinkedField",
            "name": "query",
            "plural": false,
            "selections": [
              {
                "alias": "projectNode",
                "args": (v5/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v6/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "AnnotationConfigConnection",
                        "kind": "LinkedField",
                        "name": "annotationConfigs",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "AnnotationConfigEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v8/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v6/*: any*/)
                                    ],
                                    "type": "Node",
                                    "abstractKey": "__isNode"
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "annotationType",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "description",
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "AnnotationConfigBase",
                                    "abstractKey": "__isAnnotationConfigBase"
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "CategoricalAnnotationValue",
                                        "kind": "LinkedField",
                                        "name": "values",
                                        "plural": true,
                                        "selections": [
                                          (v11/*: any*/),
                                          (v12/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "CategoricalAnnotationConfig",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "lowerBound",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "upperBound",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "optimizationDirection",
                                        "storageKey": null
                                      }
                                    ],
                                    "type": "ContinuousAnnotationConfig",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v10/*: any*/)
                                    ],
                                    "type": "FreeformAnnotationConfig",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "Project",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v7/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v6/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "filteredSpanAnnotations",
                        "args": [
                          {
                            "fields": [
                              {
                                "kind": "Literal",
                                "name": "exclude",
                                "value": {
                                  "names": [
                                    "note"
                                  ]
                                }
                              },
                              {
                                "fields": [
                                  {
                                    "kind": "Variable",
                                    "name": "userIds",
                                    "variableName": "filterUserIds"
                                  }
                                ],
                                "kind": "ObjectValue",
                                "name": "include"
                              }
                            ],
                            "kind": "ObjectValue",
                            "name": "filter"
                          }
                        ],
                        "concreteType": "SpanAnnotation",
                        "kind": "LinkedField",
                        "name": "spanAnnotations",
                        "plural": true,
                        "selections": [
                          (v6/*: any*/),
                          (v10/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "annotatorKind",
                            "storageKey": null
                          },
                          (v12/*: any*/),
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "explanation",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "createdAt",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "Span",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d6fc7191d013d596fe4687954d42a27b",
    "id": null,
    "metadata": {},
    "name": "AnnotationConfigListRemoveAnnotationConfigFromProjectMutation",
    "operationKind": "mutation",
    "text": "mutation AnnotationConfigListRemoveAnnotationConfigFromProjectMutation(\n  $projectId: GlobalID!\n  $annotationConfigId: GlobalID!\n  $spanId: GlobalID!\n  $filterUserIds: [GlobalID!]\n) {\n  removeAnnotationConfigFromProject(input: {projectId: $projectId, annotationConfigId: $annotationConfigId}) {\n    query {\n      projectNode: node(id: $projectId) {\n        __typename\n        ... on Project {\n          id\n          ...AnnotationConfigListProjectAnnotationConfigFragment\n        }\n        __isNode: __typename\n        id\n      }\n      node(id: $spanId) {\n        __typename\n        ... on Span {\n          id\n          ...SpanAnnotationsEditor_spanAnnotations_3lpqY\n        }\n        __isNode: __typename\n        id\n      }\n    }\n  }\n}\n\nfragment AnnotationConfigListProjectAnnotationConfigFragment on Project {\n  annotationConfigs {\n    edges {\n      node {\n        __typename\n        ... on Node {\n          __isNode: __typename\n          id\n        }\n        ... on AnnotationConfigBase {\n          __isAnnotationConfigBase: __typename\n          name\n          annotationType\n          description\n        }\n        ... on CategoricalAnnotationConfig {\n          values {\n            label\n            score\n          }\n        }\n        ... on ContinuousAnnotationConfig {\n          lowerBound\n          upperBound\n          optimizationDirection\n        }\n        ... on FreeformAnnotationConfig {\n          name\n        }\n      }\n    }\n  }\n}\n\nfragment SpanAnnotationsEditor_spanAnnotations_3lpqY on Span {\n  id\n  filteredSpanAnnotations: spanAnnotations(filter: {exclude: {names: [\"note\"]}, include: {userIds: $filterUserIds}}) {\n    id\n    name\n    annotatorKind\n    score\n    label\n    explanation\n    createdAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee6a15cf8b49c17684cfb0cc9b85328f";

export default node;
