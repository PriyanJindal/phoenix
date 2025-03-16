/**
 * @generated SignedSource<<89163ee4ab47c259ef52a1fdca03964a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AnnotatorKind = "HUMAN" | "LLM";
export type EditSpanAnnotationsDialogNewAnnotationQuery$variables = {
  projectId: string;
  spanId: string;
};
export type EditSpanAnnotationsDialogNewAnnotationQuery$data = {
  readonly project: {
    readonly id: string;
    readonly spanAnnotationNames?: ReadonlyArray<string>;
  };
  readonly span: {
    readonly id: string;
    readonly spanAnnotations?: ReadonlyArray<{
      readonly annotatorKind: AnnotatorKind;
      readonly id: string;
      readonly name: string;
    }>;
  };
};
export type EditSpanAnnotationsDialogNewAnnotationQuery = {
  response: EditSpanAnnotationsDialogNewAnnotationQuery$data;
  variables: EditSpanAnnotationsDialogNewAnnotationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "spanId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "projectId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "spanAnnotationNames",
      "storageKey": null
    }
  ],
  "type": "Project",
  "abstractKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "spanId"
  }
],
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SpanAnnotation",
      "kind": "LinkedField",
      "name": "spanAnnotations",
      "plural": true,
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
          "name": "annotatorKind",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Span",
  "abstractKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EditSpanAnnotationsDialogNewAnnotationQuery",
    "selections": [
      {
        "alias": "project",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "span",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditSpanAnnotationsDialogNewAnnotationQuery",
    "selections": [
      {
        "alias": "project",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "span",
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v2/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "183d7286be2b681e3c6388c0774be5af",
    "id": null,
    "metadata": {},
    "name": "EditSpanAnnotationsDialogNewAnnotationQuery",
    "operationKind": "query",
    "text": "query EditSpanAnnotationsDialogNewAnnotationQuery(\n  $projectId: ID!\n  $spanId: ID!\n) {\n  project: node(id: $projectId) {\n    __typename\n    id\n    ... on Project {\n      spanAnnotationNames\n    }\n  }\n  span: node(id: $spanId) {\n    __typename\n    id\n    ... on Span {\n      spanAnnotations {\n        id\n        name\n        annotatorKind\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f7b069bc9db6a54078de830fa2a8988";

export default node;
