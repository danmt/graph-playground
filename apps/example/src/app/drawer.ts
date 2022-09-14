import * as cytoscape from 'cytoscape';
import { MenuInstance } from 'cytoscape-cxtmenu';
import { DagreLayoutOptions } from 'cytoscape-dagre';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';

export interface InitEvent {
  type: 'Init';
}

export interface AddNodeEvent {
  type: 'AddNode';
  payload: {
    id: string;
    kind: string;
    label: string;
  };
}

export interface AddNodeSuccessEvent {
  type: 'AddNodeSuccess';
  payload: {
    id: string;
    kind: string;
    label: string;
  };
}

export interface AddEdgePreviewEvent {
  type: 'AddEdgePreview';
  payload: {
    id: string;
    source: string;
    target: string;
  };
}

export interface RemoveEdgePreviewEvent {
  type: 'RemoveEdgePreview';
  payload: {
    id: string;
    source: string;
    target: string;
  };
}

export interface AddEdgeEvent {
  type: 'AddEdge';
  payload: {
    id: string;
    source: string;
    target: string;
  };
}

export interface AddEdgeSuccessEvent {
  type: 'AddEdgeSuccess';
  payload: {
    id: string;
    source: string;
    target: string;
  };
}

export interface AddNodeToEdgeEvent {
  type: 'AddNodeToEdge';
  payload: {
    source: string;
    target: string;
    edgeId: string;
    node: {
      id: string;
      kind: string;
      label: string;
    };
  };
}

export interface AddNodeToEdgeSuccessEvent {
  type: 'AddNodeToEdgeSuccess';
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

export interface DeleteNodeSuccessEvent {
  type: 'DeleteNodeSuccess';
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

export interface DeleteEdgeSuccessEvent {
  type: 'DeleteEdgeSuccess';
  payload: string;
}

export type DrawerEvent =
  | InitEvent
  | AddNodeEvent
  | AddNodeSuccessEvent
  | AddEdgeEvent
  | AddEdgeSuccessEvent
  | AddEdgePreviewEvent 
  | RemoveEdgePreviewEvent
  | AddNodeToEdgeEvent
  | AddNodeToEdgeSuccessEvent
  | UpdateNodeEvent
  | DeleteNodeEvent
  | DeleteNodeSuccessEvent
  | ViewNodeEvent
  | DeleteEdgeEvent
  | DeleteEdgeSuccessEvent;

export const isInitEvent = (event: DrawerEvent): event is InitEvent => {
  return event.type === 'Init';
};

export const isAddNodeEvent = (event: DrawerEvent): event is AddNodeEvent => {
  return event.type === 'AddNode';
};

export const isAddNodeSuccessEvent = (
  event: DrawerEvent
): event is AddNodeSuccessEvent => {
  return event.type === 'AddNodeSuccess';
};

export const isAddNodeToEdgeEvent = (
  event: DrawerEvent
): event is AddNodeToEdgeEvent => {
  return event.type === 'AddNodeToEdge';
};

export const isAddNodeToEdgeSuccessEvent = (
  event: DrawerEvent
): event is AddNodeToEdgeSuccessEvent => {
  return event.type === 'AddNodeToEdgeSuccess';
};

export const isUpdateNodeEvent = (
  event: DrawerEvent
): event is UpdateNodeEvent => {
  return event.type === 'UpdateNode';
};

export const isDeleteNodeEvent = (
  event: DrawerEvent
): event is DeleteNodeEvent => {
  return event.type === 'DeleteNode';
};

export const isDeleteNodeSuccessEvent = (
  event: DrawerEvent
): event is DeleteNodeSuccessEvent => {
  return event.type === 'DeleteNodeSuccess';
};

export const isViewNodeEvent = (event: DrawerEvent): event is ViewNodeEvent => {
  return event.type === 'ViewNode';
};

export const isDeleteEdgeEvent = (
  event: DrawerEvent
): event is DeleteEdgeEvent => {
  return event.type === 'DeleteEdge';
};

export const isDeleteEdgeSuccessEvent = (
  event: DrawerEvent
): event is DeleteEdgeSuccessEvent => {
  return event.type === 'DeleteEdgeSuccess';
};

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
    this._graph.on('add', 'node', (ev) => {
      const node = ev.target;
      const nodeData = node.data();

      if (nodeData.emitChanges) {
        node.data({ emitChanges: false });

        this._event.next({
          type: 'AddNodeSuccess',
          payload: {
            id: nodeData.id,
            kind: nodeData.kind,
            label: nodeData.label,
          },
        });
      }
    });

    this._graph.on('remove', 'node', (ev) => {
      const node = ev.target;
      const nodeData = node.data();

      if (nodeData.emitChanges) {
        this._event.next({
          type: 'DeleteNodeSuccess',
          payload: nodeData.id,
        });
      }
    });

    this._graph.on('ehpreviewon', (_, ...extraParams) => {
      const source = [...(extraParams as unknown[])][0] as cytoscape.NodeSingular;
      const target = [...(extraParams as unknown[])][1] as cytoscape.NodeSingular;

      this._event.next({
        type: 'AddEdgePreview',
        payload: {
          id: `${source.id()}/${target.id()}`,
          source: source.id(),
          target: target.id(),
        },
      });
    });

    this._graph.on('ehpreviewoff', (_, ...extraParams) => {
      const source = [...(extraParams as unknown[])][0] as cytoscape.NodeSingular;
      const target = [...(extraParams as unknown[])][1] as cytoscape.NodeSingular;

      this._event.next({
        type: 'RemoveEdgePreview',
        payload: {
          id: `${source.id()}/${target.id()}`,
          source: source.id(),
          target: target.id(),
        },
      });
    });

    this._graph.on('ehcomplete', (_, ...extraParams) => {
      const edge = [...(extraParams as unknown[])][2] as cytoscape.EdgeSingular;
      const edgeData = edge.data();

      edge.data({ isPreview: false });

      if (edgeData.emitChanges) {
        this._event.next({
          type: 'AddEdgeSuccess',
          payload: {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
          },
        });
      }
    });

    this._graph.on('add', 'edge', (ev) => {
      const edge = ev.target;
      const edgeData = edge.data();

      if (edgeData.emitChanges && !edgeData.isPreview) {
        this._event.next({
          type: 'AddEdgeSuccess',
          payload: {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
          },
        });
      }
    });

    this._graph.on('remove', 'edge', (ev) => {
      const edge = ev.target;
      const edgeData = edge.data();
      
      if (edgeData.emitChanges && !edgeData.isPreview) {
        this._event.next({
          type: 'DeleteEdgeSuccess',
          payload: edgeData.id,
        });
      }
    });
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
              this.removeNodeFromGraph(node.id());
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
              this.addNodeToEdge(
                edge.data().source,
                edge.data().target,
                edge.id(),
                {
                  id: uuid(),
                  kind: 'faucet',
                  label: 'Canilla #2',
                  emitChanges: true,
                }
              );
            }
          },
        },
        {
          content: 'delete',
          select: (edge) => {
            if (edge.isEdge()) {
              this.removeEdgeFromGraph(edge.id());
            }
          },
        },
      ],
    });
  }

  setupEdgeHandles() {
    this._edgeHandles = this._graph.edgehandles({
      snap: true,
      canConnect: (source, target) => {
        if (source.id() === target.id()) {
          return false;
        }

        const element = this._graph.getElementById(
          `${source.id()}/${target.id()}`
        );

        return element.id() === undefined;
      },
      edgeParams: (source, target) => {
        return {
          data: {
            id: `${source.id()}/${target.id()}`,
            emitChanges: true,
            isPreview: true,
          },
        };
      },
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

  addNode(data: cytoscape.NodeDataDefinition, emitChanges = true) {
    if (emitChanges) {
      this._event.next({
        type: 'AddNode',
        payload: {
          id: data.id ?? '',
          kind: data['kind'],
          label: data['label'],
        },
      });
    }
    this._graph.add({ data: { ...data, emitChanges }, group: 'nodes' });
  }

  addNodeToEdge(
    sourceId: string,
    targetId: string,
    edgeId: string,
    data: cytoscape.NodeDataDefinition
  ) {
    this._event.next({
      type: 'AddNodeToEdge',
      payload: {
        source: sourceId,
        target: targetId,
        edgeId,
        node: {
          id: data.id ?? '',
          kind: data['kind'],
          label: data['label'],
        },
      },
    });
    this._graph.remove(`edge[id = '${edgeId}']`);
    this._graph.add([
      { data: { ...data, emitChanges: true }, group: 'nodes' },
      {
        group: 'edges',
        data: { source: sourceId, target: data.id, emitChanges: true },
      },
      {
        group: 'edges',
        data: { source: data.id, target: targetId, emitChanges: true },
      },
    ]);
  }

  removeNodeFromGraph(id: string, emitChanges = true) {
    if (emitChanges) {
      this._event.next({ type: 'DeleteNode', payload: id });
    }
    const node = this._graph.nodes(`node[id = '${id}']`).first();
    node.data({ emitChanges });
    this._graph.remove(`node[id = '${id}']`);
  }

  removeEdgeFromGraph(id: string) {
    this._event.next({ type: 'DeleteEdge', payload: id });
    this._graph.remove(`edge[id = '${id}']`);
  }

  setDrawMode(drawMode: boolean) {
    if (drawMode) {
      this._edgeHandles?.enableDrawMode();
    } else {
      this._edgeHandles?.disableDrawMode();
    }
  }
}
