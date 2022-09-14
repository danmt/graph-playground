import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as cytoscape from 'cytoscape';
import * as cytoscapeCxtmenu from 'cytoscape-cxtmenu';
import * as cytoscapeDagre from 'cytoscape-dagre';
import * as cytoscapeEdgehandles from 'cytoscape-edgehandles';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  getFirestore,
  provideFirestore,
  connectFirestoreEmulator
} from '@angular/fire/firestore';
import {
  getFunctions,
  provideFunctions,
  connectFunctionsEmulator
} from '@angular/fire/functions';

if (environment.production) {
  enableProdMode();
}

cytoscape.use(cytoscapeDagre);
cytoscape.use(cytoscapeCxtmenu);
cytoscape.use(cytoscapeEdgehandles);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFirestore(() => {
        const firestore = getFirestore();

        connectFirestoreEmulator(firestore,'localhost', 8080);

        return firestore;
      }),
      provideFunctions(() => {
        const functions = getFunctions();

        connectFunctionsEmulator(functions,'localhost', 5001);

        return functions;
      }),
    ),
  ],
}).catch((err) => console.error(err));
