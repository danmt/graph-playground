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
    image: string;
  };
}

export interface AddNodeSuccessEvent {
  type: 'AddNodeSuccess';
  payload: {
    id: string;
    kind: string;
    label: string;
    image: string;
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
      image: string;
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
        selector: 'node',
        style: {
          width: 280,
          height: 85,
          'background-width': '280px',
          'background-height': '85px',
          'border-color': '#565656',
          'border-width': 0,
          'border-opacity': 0,
          'background-opacity': 0,
          "font-size": "12px",
          shape: 'round-rectangle',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-max-width': '150px',
          'text-wrap': "wrap",
          'text-margin-x': 10,
          'text-margin-y': -5,
          'text-justification': 'left',
          'line-height': 1.3,
          content: 'data(label)',
          'background-position-x': '0',
          'background-image': 'data(image)',
          'color': 'white',
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          width: 6,
          'target-arrow-shape': 'triangle',
          'line-color': '#5E6469',
          'target-arrow-color': '#5E6469',
          'source-endpoint': 'inside-to-node',
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
  }).nodeHtmlLabel([{
    query: '.l1',
    valignBox: "top",
    halignBox: "left",
    tpl: function() {
        return '<p class="bp-node-label">.</p>';
    }
    },
]);;

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

      if (nodeData.emitCreateEvent) {
        this._event.next({
          type: 'AddNodeSuccess',
          payload: {
            id: nodeData.id,
            kind: nodeData.kind,
            label: nodeData.label,
            image: nodeData.image
          },
        });
      }
    });

    this._graph.on('remove', 'node', (ev) => {
      const node = ev.target;
      const nodeData = node.data();

      if (nodeData.emitDeleteEvent) {
        this._event.next({
          type: 'DeleteNodeSuccess',
          payload: nodeData.id,
        });
      }
    });

    this._graph.on('ehpreviewon', (_, ...extraParams) => {
      const source = [
        ...(extraParams as unknown[]),
      ][0] as cytoscape.NodeSingular;
      const target = [
        ...(extraParams as unknown[]),
      ][1] as cytoscape.NodeSingular;

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
      const source = [
        ...(extraParams as unknown[]),
      ][0] as cytoscape.NodeSingular;
      const target = [
        ...(extraParams as unknown[]),
      ][1] as cytoscape.NodeSingular;

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

      if (edgeData.emitCreateEvent && !edgeData.isPreview) {
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

      if (edgeData.emitDeleteEvent && !edgeData.isPreview) {
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
              this.removeNodeFromGraph(node.id(), { emitEvent: true });
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
                  image: '',
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
              this.removeEdgeFromGraph(edge.id(), { emitEvent: false });
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

  addNode(
    data: cytoscape.NodeDataDefinition,
    options: {
      emitEvent: boolean;
      emitCreateEvent: boolean;
      emitDeleteEvent: boolean;
    }
  ) {
    if (options.emitEvent) {
      this._event.next({
        type: 'AddNode',
        payload: {
          id: data.id ?? '',
          kind: data['kind'],
          label: data['label'],
          image: data['image'],
        },
      });
    }
    this._graph.add({
      data: {
        ...data,
        emitCreateEvent: options.emitCreateEvent,
        emitDeleteEvent: options.emitDeleteEvent,
      },
      group: 'nodes',
    });
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
          image: data['image'],
        },
      },
    });
    this._graph.remove(`edge[id = '${edgeId}']`);
    this._graph.add([
      {
        data: { ...data, emitCreateEvent: true, emitDeleteEvent: true },
        group: 'nodes',
      },
      {
        group: 'edges',
        data: {
          source: sourceId,
          target: data.id,
          emitCreateEvent: true,
          emitDeleteEvent: true,
        },
      },
      {
        group: 'edges',
        data: {
          source: data.id,
          target: targetId,
          emitCreateEvent: true,
          emitDeleteEvent: true,
        },
      },
    ]);
  }

  removeNodeFromGraph(id: string, options: { emitEvent: boolean }) {
    if (options.emitEvent) {
      this._event.next({ type: 'DeleteNode', payload: id });
    }
    this._graph.remove(`node[id = '${id}']`);
  }

  addEdge(
    data: cytoscape.EdgeDataDefinition,
    options: {
      emitEvent: boolean;
      emitCreateEvent: boolean;
      emitDeleteEvent: boolean;
    }
  ) {
    if (options.emitEvent) {
      this._event.next({
        type: 'AddEdge',
        payload: {
          id: data.id ?? '',
          source: data['source'],
          target: data['target'],
        },
      });
    }
    this._graph.add({
      data: {
        ...data,
        emitCreateEvent: options.emitCreateEvent,
        emitDeleteEvent: options.emitDeleteEvent,
      },
      group: 'edges',
    });
  }

  removeEdgeFromGraph(id: string, options: { emitEvent: boolean }) {
    if (options.emitEvent) {
      this._event.next({ type: 'DeleteEdge', payload: id });
    }
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
