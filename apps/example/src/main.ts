import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import * as cytoscape from 'cytoscape';
import * as cytoscapeCxtmenu from 'cytoscape-cxtmenu';
import * as cytoscapeDagre from 'cytoscape-dagre';
import * as cytoscapeEdgehandles from 'cytoscape-edgehandles';
import * as cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

cytoscape.use(cytoscapeDagre);
cytoscape.use(cytoscapeCxtmenu);
cytoscape.use(cytoscapeEdgehandles);
cytoscape.use(cytoscapeNodeHtmlLabel as cytoscape.Ext);

bootstrapApplication(AppComponent, {
  providers: [],
}).catch((err) => console.error(err));
