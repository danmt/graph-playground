import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();
admin.initializeApp();
const firestore = admin.firestore();

export const publishEvent = functions.https.onCall(async (data, context) => {
  const eventCollectionRef = firestore.collection('events');

  functions.logger.info('data', data);

  let topic;

  try {
    topic = pubsub.topic('events');
  } catch (error) {
    functions.logger.error(error);
  }

  if (!topic) {
    await pubsub.createTopic('events');
    topic = pubsub.topic('events');
  }

  topic.publishJSON(
    {
      ...data,
      id: eventCollectionRef.doc().id,
    },
    (error) => {
      functions.logger.error(error);
    }
  );

  return {
    message: 'yoo',
  };
});

export const persistEvent = functions.pubsub
  .topic('events')
  .onPublish(async (message) => {
    const messageBody = message.data
      ? JSON.parse(Buffer.from(message.data, 'base64').toString())
      : null;

    const eventRef = firestore.doc(`events/${messageBody.id}`);

    await eventRef.set({
      payload: messageBody.payload,
      type: messageBody.type,
      graphId: messageBody.graphId,
      clientId: messageBody.clientId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  });

export const mutateGraphState = functions.pubsub
  .topic('events')
  .onPublish(async (message) => {
    const messageBody = message.data
      ? JSON.parse(Buffer.from(message.data, 'base64').toString())
      : null;
    const graphRef = firestore.doc(`graphs/${messageBody.graphId}`);

    return firestore.runTransaction(async (transaction) => {
      const graph = await transaction.get(graphRef);
      const graphData = graph.data();

      if (graphData === undefined) {
        return false;
      }

      switch (messageBody.type) {
        case 'AddNodeSuccess': {
          transaction.update(graphRef, {
            nodes: [...graphData['nodes'], messageBody.payload],
            lastEventId: messageBody.id,
          });
          break;
        }
        case 'AddNodeToEdgeSuccess': {
          transaction.update(graphRef, {
            edges: graphData['edges'].filter((edge: { id: string }) => {
              return edge.id !== messageBody.payload.edgeId;
            }).concat([
              {
                id: `${messageBody.payload.source}/${messageBody.payload.node.id}`,
                source: messageBody.payload.source,
                target: messageBody.payload.node.id,
              },
              {
                id: `${messageBody.payload.node.id}/${messageBody.payload.target}`,
                source: messageBody.payload.node.id,
                target: messageBody.payload.target,
              }
            ]),
            nodes: [...graphData['nodes'], messageBody.payload.node],
            lastEventId: messageBody.id,
          });
          break;
        }
        case 'DeleteNodeSuccess': {
          transaction.update(graphRef, {
            nodes: graphData['nodes'].filter((node: { id: string }) => {
              return node.id !== messageBody.payload;
            }),
            edges: graphData['edges'].filter((edge: { source: string, target: string }) => {
              return edge.source !== messageBody.payload && edge.target !== messageBody.payload;
            }),
            lastEventId: messageBody.id,
          });
          break;
        }
        case 'AddEdgeSuccess': {
          transaction.update(graphRef, {
            edges: [...graphData['edges'], messageBody.payload],
            lastEventId: messageBody.id,
          });
          break;
        }
        case 'DeleteEdgeSuccess': {
            transaction.update(graphRef, {
              edges: graphData['edges'].filter((edge: { id: string }) => {
                return edge.id !== messageBody.payload;
              }),
              lastEventId: messageBody.id,
            });
            break;
          }
        default:
          return false;
      }

      return true;
    });
  });
