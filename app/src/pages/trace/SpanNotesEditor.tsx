import React, { startTransition, useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { css } from "@emotion/react";

import { Flex, View } from "@phoenix/components";
import {
  MessageBar,
  MessageBubble,
  MessageBubbleSkeleton,
} from "@phoenix/components/chat";

import { SpanNotesEditorAddNoteMutation } from "./__generated__/SpanNotesEditorAddNoteMutation.graphql";
import { SpanNotesEditorQuery } from "./__generated__/SpanNotesEditorQuery.graphql";

type SpanNotesEditorProps = {
  spanNodeId: string;
};

const notesListCSS = css`
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--ac-global-dimension-size-100);
  padding: var(--ac-global-dimension-size-100);
  box-sizing: border-box;
  li {
    width: 100%;
  }
`;

export function SpanNotesEditor(props: SpanNotesEditorProps) {
  const [fetchKey, setFetchKey] = useState(0);
  const notesEndRef = useRef<HTMLDivElement>(null);
  // TODO: add filter by note annotations
  const data = useLazyLoadQuery<SpanNotesEditorQuery>(
    graphql`
      query SpanNotesEditorQuery($spanNodeId: GlobalID!) {
        viewer {
          id
          username
          profilePictureUrl
        }
        span: node(id: $spanNodeId) {
          ... on Span {
            spanAnnotations {
              id
              name
              explanation
              createdAt
              user {
                id
                username
                profilePictureUrl
              }
            }
            ...SpanFeedback_annotations
          }
        }
      }
    `,
    {
      spanNodeId: props.spanNodeId,
    },
    {
      fetchKey: fetchKey,
      fetchPolicy: "store-and-network",
    }
  );

  const [addNote, isAddingNote] = useMutation<SpanNotesEditorAddNoteMutation>(
    graphql`
      mutation SpanNotesEditorAddNoteMutation(
        $input: CreateSpanAnnotationInput!
      ) {
        createSpanAnnotations(input: [$input]) {
          __typename
        }
      }
    `
  );

  const onAddNote = (note: string) => {
    startTransition(() => {
      addNote({
        variables: {
          input: {
            name: "note",
            explanation: note,
            annotatorKind: "HUMAN",
            source: "APP",
            spanId: props.spanNodeId,
          },
        },
      });
      setFetchKey(fetchKey + 1);
    });
  };

  const annotations = data.span?.spanAnnotations || [];

  const notes = annotations.filter(
    // TODO: remove this hard coding
    (annotation) => annotation.name === "note"
  );

  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [notes]);

  return (
    <Flex direction="column" height="100%" justifyContent="space-between">
      <ul css={notesListCSS}>
        {notes.map((note) => (
          <li key={note.id}>
            <MessageBubble
              text={note.explanation || ""}
              timestamp={new Date(note.createdAt)}
              userName={note.user?.username || "system"}
              userPicture={note.user?.profilePictureUrl}
              isOutgoing={note.user?.id === data.viewer?.id}
            />
          </li>
        ))}
        <div ref={notesEndRef} aria-hidden="true" />
      </ul>
      <MessageBar
        onSendMessage={onAddNote}
        placeholder="Add a note"
        isSending={isAddingNote}
      />
    </Flex>
  );
}

export function SpanNotesEditorSkeleton() {
  return (
    <Flex direction="column" height="100%" justifyContent="space-between">
      <View padding="size-100">
        <Flex direction="column" gap="size-100" height="100%">
          <MessageBubbleSkeleton isOutgoing={false} height={70} />
          <MessageBubbleSkeleton isOutgoing={true} height={40} />
        </Flex>
      </View>
      <MessageBar onSendMessage={() => {}} placeholder="Add a note" />
    </Flex>
  );
}
