import * as cytoscape from 'cytoscape';
import { MenuInstance } from 'cytoscape-cxtmenu';
import { DagreLayoutOptions } from 'cytoscape-dagre';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import { BehaviorSubject } from 'rxjs';

export interface InitEvent {
  type: 'Init';
}

export interface AddNodeEvent {
  type: 'AddNode';
}

export interface AddNodeToEdgeEvent {
  type: 'AddNodeToEdge';
  payload: string;
}

export interface UpdateNodeEvent {
  type: 'UpdateNode';
  payload: string;
}

export interface DeleteNodeEvent {
  type: 'DeleteNode';
  payload: string;
}

export interface ViewNodeEvent {
  type: 'ViewNode';
  payload: string;
}

export interface DeleteEdgeEvent {
  type: 'DeleteEdge';
  payload: string;
}

export type DrawerEvent =
  | InitEvent
  | AddNodeEvent
  | AddNodeToEdgeEvent
  | UpdateNodeEvent
  | DeleteNodeEvent
  | ViewNodeEvent
  | DeleteEdgeEvent;

export const createGraph = (
  container: HTMLElement,
  nodes: cytoscape.NodeDefinition[],
  edges: cytoscape.EdgeDefinition[]
) =>
  cytoscape({
    container,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      // Style all nodes/edges
      {
        selector: 'node[label]',
        style: {
          height: 80,
          width: 80,
          'background-width': '64px',
          'background-height': '64px',
          'border-color': '#000',
          'border-width': 3,
          'border-opacity': 0.5,
          shape: 'round-rectangle',
          'background-color': '#fff',
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': 8,
          content: 'data(label)',
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          width: 6,
          'target-arrow-shape': 'triangle',
          'line-color': '#3492eb',
          'target-arrow-color': '#3492eb',
        },
      },
      // Give each node kind a background image
      {
        selector: 'node[kind = "faucet"]',
        style: {
          'background-image': 'assets/faucet.svg',
        },
      },
      {
        selector: 'node[kind = "filter"]',
        style: {
          'background-image': 'assets/filter.svg',
        },
      },
      {
        selector: 'node[kind = "gravity"]',
        style: {
          'background-image': 'assets/gravity.svg',
        },
      },
      {
        selector: 'node[kind = "plant"]',
        style: {
          'background-image': 'assets/plant.svg',
        },
      },
      {
        selector: 'node[kind = "pump"]',
        style: {
          'background-image': 'assets/pump.svg',
        },
      },
      {
        selector: 'node[kind = "splitter"]',
        style: {
          'background-image': 'assets/splitter.svg',
        },
      },
      {
        selector: 'node[kind = "valve"]',
        style: {
          'background-image': 'assets/valve.svg',
        },
      },
      {
        selector: 'node[kind = "water-tank"]',
        style: {
          'background-image': 'assets/water-tank.svg',
        },
      },
      {
        selector: 'node[kind = "water-well"]',
        style: {
          'background-image': 'assets/water-well.svg',
        },
      },
      // Style the edge handles extension
      {
        selector: '.eh-hover',
        style: {
          'background-color': 'red',
        },
      },
      {
        selector: '.eh-source',
        style: {
          'border-width': 2,
          'border-color': 'red',
        },
      },
      {
        selector: '.eh-target',
        style: {
          'border-width': 2,
          'border-color': 'red',
        },
      },
      {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
          'line-color': 'red',
          'target-arrow-color': 'red',
          'source-arrow-color': 'red',
        },
      },
      {
        selector: '.eh-ghost-edge.eh-preview-active',
        style: {
          opacity: 0,
        },
      },
    ],
    elements: {
      nodes,
      edges,
    },
  });

export class Drawer {
  private _layout: cytoscape.Layouts | null = null;
  private _nodeCxtMenu: MenuInstance | null = null;
  private _edgeCxtMenu: MenuInstance | null = null;
  private _edgeHandles: EdgeHandlesInstance | null = null;
  private _rankDir: 'TB' | 'LR' = 'TB';

  private readonly _event = new BehaviorSubject<DrawerEvent>({ type: 'Init' });
  readonly event$ = this._event.asObservable();

  constructor(private readonly _graph: cytoscape.Core) {}

  initialize() {
    // Set up graph layout
    this.setupLayout();
    // Set up extensions
    this.setupNodeContextMenu();
    this.setupEdgeContextMenu();
    this.setupEdgeHandles();
    // Listen to events
    // this._graph.promiseOn('add', 'node, edge').then(() => this.onElementAdded);
  }

  setupNodeContextMenu() {
    this._nodeCxtMenu = this._graph.cxtmenu({
      selector: 'node',
      commands: [
        {
          content: 'info',
          select: (node) => {
            if (node.isNode()) {
              this._event.next({ type: 'ViewNode', payload: node.id() });
            }
          },
        },
        {
          content: 'edit',
          select: (node) => {
            if (node.isNode()) {
              this._event.next({ type: 'UpdateNode', payload: node.id() });
            }
          },
        },
        {
          content: 'delete',
          select: (node) => {
            if (node.isNode()) {
              this._event.next({ type: 'DeleteNode', payload: node.id() });
            }
          },
        },
      ],
    });
  }

  setupEdgeContextMenu() {
    this._edgeCxtMenu = this._graph.cxtmenu({
      selector: 'edge',
      commands: [
        {
          content: 'add',
          select: (edge) => {
            if (edge.isEdge()) {
              this._event.next({ type: 'AddNodeToEdge', payload: edge.id() });
            }
          },
        },
        {
          content: 'delete',
          select: (edge) => {
            if (edge.isEdge()) {
              this._event.next({ type: 'DeleteEdge', payload: edge.id() });
            }
          },
        },
      ],
    });
  }

  setupEdgeHandles() {
    this._edgeHandles = this._graph.edgehandles({
      snap: true,
    });
  }

  setupLayout(rankDir: 'TB' | 'LR' = 'TB') {
    this._rankDir = rankDir;
    this._layout = this._graph.makeLayout({
      name: 'dagre',
      directed: true,
      padding: 10,
      rankDir,
      spacingFactor: 1.5,
      fit: true,
      nodeDimensionsIncludeLabels: true,
    } as DagreLayoutOptions);
    this._layout.run();
  }

  restartLayout() {
    this.setupLayout(this._rankDir);
  }

  addNode(data: cytoscape.NodeDataDefinition) {
    this._graph.add({ data, group: 'nodes' });
  }

  addNodeToEdge(
    edge: cytoscape.EdgeSingular,
    data: cytoscape.NodeDataDefinition
  ) {
    this._graph.remove(edge);
    this._graph.add([
      { data, group: 'nodes' },
      {
        group: 'edges',
        data: { source: edge.data('source'), target: data.id },
      },
      {
        group: 'edges',
        data: { source: data.id, target: edge.data('target') },
      },
    ]);
  }

  removeNodeFromGraph(node: cytoscape.NodeSingular) {
    this._graph.remove(node);
  }

  removeEdgeFromGraph(edge: cytoscape.EdgeSingular) {
    this._graph.remove(edge);
  }

  setDrawMode(drawMode: boolean) {
    if (drawMode) {
      this._edgeHandles?.enableDrawMode();
    } else {
      this._edgeHandles?.disableDrawMode();
    }
  }
}
