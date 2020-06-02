import functions from './functions';
import PathOperators from './models/path-oerators';
import { URL } from 'url';
import Tutorial  from './models/tutorial';
import admin from './admin';
import Step from './models/step';

export const onTutorialCreate = functions.firestore
  .document('/users/{userId}/tutorials/{tutorialId}')
  .onCreate(async (snap, context) => {
    const newValue: any = snap.data();
    const pathOperator = PathOperators.find(p => p.value === newValue.pathOperator);
    if (!pathOperator) return;
    try {
      await snap.ref.update({
        pathPriority: pathOperator.pathPriority,
      })
    } catch (error) {
      console.error(error);
    }
  });

export const onTutorialUpdate = functions.firestore
  .document('/users/{userId}/tutorials/{tutorialId}')
  .onUpdate(async (snap, context) => {
    const newValue: any = snap.after.data();
    const pathOperator = PathOperators.find(p => p.value === newValue.pathOperator);
    if (!pathOperator) return;
    try {
      await snap.after.ref.update({
        pathPriority: pathOperator.pathPriority,
      });
    } catch (error) {
      console.error(error);
    }
  });

export const onTutorialDelete = functions.firestore
  .document('/users/{userId}/tutorials/{tutorialId}')
  .onDelete(async (snap, context) => {
    try {
      const stepsSnapshot = await snap.ref.collection('steps').get();
      if (stepsSnapshot.docs.length > 0) {
        await Promise.all(stepsSnapshot.docs.map(doc => doc.ref.delete()));
      }
      const performancesSnapshot = await snap.ref.collection('performances').get();
      if (performancesSnapshot.docs.length > 0) {
        await Promise.all(performancesSnapshot.docs.map(doc => doc.ref.delete()));
      }
      const errorsSnapshot = await snap.ref.collection('errors').get();
      if (errorsSnapshot.docs.length > 0) {
        await Promise.all(errorsSnapshot.docs.map(doc => doc.ref.delete()));
      }
    } catch (error) {
      console.error(error);
    }
  });

export const getTutorial = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    return response.sendStatus(204);
  } else if (request.method === 'POST') {
    if (request.body === undefined || request.body.url === undefined || request.body.key === undefined || request.body.once === undefined) {
      return response.status(422).send('Unprocessable Entity');
    }
    let selectedTutorial: Tutorial|null = null;
    const url = new URL(request.body.url);
    const userKey = request.body.key;
    const once: string[] = request.body.once;
    const tutorialRefs: FirebaseFirestore.QuerySnapshot = await admin.firestore().collection("users").doc(userKey).collection('tutorials').where('isActive', '==', true).orderBy('pathPriority', 'asc').get();
    const matchedTutorials: Tutorial[] = [];
    tutorialRefs.forEach(ref => {
      const tutorial = new Tutorial(ref.data());
      if (!once.includes(ref.id) && tutorial.couldBeShownOn(url)) {
        if (tutorial.hasSameParameters(url)) {
          if (!tutorial.domain || tutorial.couldBeShownOn(url, true)) {
            matchedTutorials.push(tutorial);
          }
        }
      }
    });
    if (matchedTutorials.length > 0) {
      selectedTutorial = matchedTutorials[0];
    }
    if (selectedTutorial) {
      const selectedTutorialRef = admin.firestore().collection("users").doc(userKey).collection('tutorials').doc(selectedTutorial.id!)
      const stepRefs = await selectedTutorialRef.collection('steps').orderBy('order', 'asc').get();
      selectedTutorial.steps = stepRefs.docs.map(ref => {
        return new Step(ref.data());
      })
    }
    return response.status(200).send({
      tutorial: selectedTutorial,
    });
  }
  return response.status(405).send('Method Not Allowed');
});

export const storePerformance = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    return response.sendStatus(204);
  } else if (request.method === 'POST') {
    const tutorialId: string = request.body.tutorialId;
    const userKey: string = request.body.key;
    if (!request.body || !tutorialId || !userKey) {
      return response.status(422).send('Unprocessable Entity');
    }
    const ref = admin.firestore().collection("users").doc(userKey).collection('tutorials').doc(tutorialId).collection("performances").doc();
    await ref.set({
      completeSteps: request.body.completeSteps,
      allSteps: request.body.allSteps,
      complete: request.body.complete,
      elapsedTime: request.body.elapsedTime,
      customerId: request.body.customerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return response.sendStatus(200);
  }
  return response.status(405).send('Method Not Allowed');
});

export const logError = functions.https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    return response.sendStatus(204);
  } else if (request.method === 'POST') {
    const tutorialId: string = request.body.tutorialId;
    const userKey: string = request.body.key;
    if (!request.body || !userKey || !tutorialId) {
      return response.status(422).send('Unprocessable Entity');
    }
    const ref = admin.firestore().collection("users").doc(userKey).collection('tutorials').doc(tutorialId).collection("errors").doc();
    await ref.set({
      message: request.body.message,
      stepIndex: request.body.stepIndex,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return response.sendStatus(200);
  }
  return response.status(405).send('Method Not Allowed');
});
