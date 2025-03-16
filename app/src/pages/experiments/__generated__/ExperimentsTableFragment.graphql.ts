/**
 * @generated SignedSource<<da4ada1353903d011f3058389b0583c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ExperimentsTableFragment$data = {
  readonly experimentAnnotationSummaries: ReadonlyArray<{
    readonly annotationName: string;
    readonly maxScore: number | null;
    readonly minScore: number | null;
  }>;
  readonly experiments: {
    readonly __id: string;
    readonly edges: ReadonlyArray<{
      readonly experiment: {
        readonly annotationSummaries: ReadonlyArray<{
          readonly annotationName: string;
          readonly meanScore: number | null;
        }>;
        readonly averageRunLatencyMs: number | null;
        readonly createdAt: string;
        readonly description: string | null;
        readonly errorRate: number | null;
        readonly id: string;
        readonly metadata: any;
        readonly name: string;
        readonly project: {
          readonly id: string;
        } | null;
        readonly runCount: number;
        readonly sequenceNumber: number;
      };
    }>;
  };
  readonly id: string;
  readonly " $fragmentType": "ExperimentsTableFragment";
};
export type ExperimentsTableFragment$key = {
  readonly " $data"?: ExperimentsTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ExperimentsTableFragment">;
};

import ExperimentsTableQuery_graphql from './ExperimentsTableQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "experiments"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "annotationName",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "after"
    },
    {
      "defaultValue": 100,
      "kind": "LocalArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": ExperimentsTableQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "ExperimentsTableFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ExperimentAnnotationSummary",
      "kind": "LinkedField",
      "name": "experimentAnnotationSummaries",
      "plural": true,
      "selections": [
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "minScore",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "maxScore",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": "experiments",
      "args": null,
      "concreteType": "ExperimentConnection",
      "kind": "LinkedField",
      "name": "__ExperimentsTable_experiments_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ExperimentEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": "experiment",
              "args": null,
              "concreteType": "Experiment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v2/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "sequenceNumber",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "description",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "createdAt",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "metadata",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "errorRate",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "runCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "averageRunLatencyMs",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Project",
                  "kind": "LinkedField",
                  "name": "project",
                  "plural": false,
                  "selections": [
                    (v2/*: any*/)
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ExperimentAnnotationSummary",
                  "kind": "LinkedField",
                  "name": "annotationSummaries",
                  "plural": true,
                  "selections": [
                    (v1/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "meanScore",
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
              "concreteType": "Experiment",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
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
        },
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__id",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    },
    (v2/*: any*/)
  ],
  "type": "Dataset",
  "abstractKey": null
};
})();

(node as any).hash = "b7cac85fa8fe9ad556978669a3d2fa0e";

export default node;
