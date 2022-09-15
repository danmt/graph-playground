import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Injectable,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ComponentStore,
  OnStoreInit,
  provideComponentStore,
} from '@ngrx/component-store';
import {
  EdgeDataDefinition,
  EdgeDefinition,
  NodeDataDefinition,
  NodeDefinition,
} from 'cytoscape';
import { concatMap, EMPTY, firstValueFrom, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { createGraph, Drawer } from './drawer';
import { EventApiService } from './event-api.service';
import { GraphApiService } from './graph-api.service';

type Direction = 'vertical' | 'horizontal';

interface ViewModel {
  drawer: Drawer | null;
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  elementRef: ElementRef<HTMLElement> | null;
  direction: Direction;
  drawMode: boolean;
}

const initialState: ViewModel = {
  drawer: null,
  nodes: [],
  edges: [],
  elementRef: null,
  direction: 'vertical',
  drawMode: false,
};

@Injectable()
export class DrawerStore
  extends ComponentStore<ViewModel>
  implements OnStoreInit
{
  readonly direction$ = this.select(({ direction }) => direction);

  readonly drawMode$ = this.select(({ drawMode }) => drawMode);

  readonly graph$ = this.select(
    this.select(({ elementRef }) => elementRef),
    this.select(({ nodes }) => nodes),
    this.select(({ edges }) => edges),
    (elementRef, nodes, edges) => {
      if (elementRef === null) {
        return null;
      }

      return createGraph(elementRef.nativeElement, nodes, edges);
    },
    { debounce: true }
  );

  readonly drawer$ = this.select(
    this.graph$,
    (graph) => {
      if (graph === null) {
        return null;
      }

      const drawer = new Drawer(graph);

      drawer.initialize();

      return drawer;
    },
    { debounce: true }
  );

  readonly event$ = this.select(
    this.drawer$.pipe(
      switchMap((drawer) => {
        if (drawer === null) {
          return EMPTY;
        }

        return drawer.event$;
      })
    ),
    (event) => event
  );

  readonly setNodes = this.updater<NodeDataDefinition[]>((state, nodes) => ({
    ...state,
    nodes: nodes.map((node) => ({
      data: node,
    })),
  }));

  readonly setEdges = this.updater<EdgeDataDefinition[]>((state, edges) => ({
    ...state,
    edges: edges.map((edge) => ({
      data: edge,
    })),
  }));

  readonly setElementRef = this.updater<ElementRef<HTMLElement>>(
    (state, elementRef) => ({
      ...state,
      elementRef,
    })
  );

  readonly setDirection = this.updater<Direction>((state, direction) => ({
    ...state,
    direction,
  }));

  readonly setDrawMode = this.updater<boolean>((state, drawMode) => ({
    ...state,
    drawMode,
  }));

  private readonly _handleDrawModeChange = this.effect<{
    drawer: Drawer | null;
    drawMode: boolean;
  }>(
    tap(({ drawer, drawMode }) => {
      if (drawer !== null) {
        drawer.setDrawMode(drawMode);
      }
    })
  );

  private readonly _handleDirectionChange = this.effect<{
    drawer: Drawer | null;
    direction: Direction;
  }>(
    tap(({ drawer, direction }) => {
      if (drawer !== null) {
        drawer.setupLayout(direction === 'vertical' ? 'TB' : 'LR');
      }
    })
  );

  constructor() {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this._handleDrawModeChange(
      this.select(this.drawer$, this.drawMode$, (drawer, drawMode) => ({
        drawer,
        drawMode,
      }))
    );
    this._handleDirectionChange(
      this.select(this.drawer$, this.direction$, (drawer, direction) => ({
        drawer,
        direction,
      }))
    );
  }

  async restartLayout() {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.restartLayout();
    }
  }

  async addNode(nodeData: NodeDataDefinition) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.addNode(nodeData);
    }
  }

  async handleNodeAdded(nodeData: NodeDataDefinition) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.handleNodeAdded(nodeData);
    }
  }

  async handleNodeAddedToEdge({
    node,
    source,
    target,
    edgeId,
  }: {
    node: NodeDataDefinition;
    source: string;
    target: string;
    edgeId: string;
  }) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.handleNodeAddedToEdge(node, source, target, edgeId);
    }
  }

  async handleNodeRemoved(nodeId: string) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.handleNodeRemoved(nodeId);
    }
  }

  async handleEdgeAdded(edgeData: EdgeDataDefinition) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.handleEdgeAdded(edgeData);
    }
  }

  async handleEdgeRemoved(edgeId: string) {
    const drawer = await firstValueFrom(this.drawer$);

    if (drawer !== null) {
      drawer.handleEdgeRemoved(edgeId);
    }
  }
}

@Component({
  selector: 'cy-root',
  template: `
    <div style="display: flex; height: 100vh">
      <div id="sidebar">
        <label>
          Draw Mode:
          <input
            type="checkbox"
            name="draw-mode"
            [ngModel]="(drawMode$ | async) ?? false"
            (ngModelChange)="onDrawModeChange($event)"
          />
        </label>

        <fieldset>
          Direction:

          <input
            type="radio"
            id="vertical"
            name="direction"
            value="vertical"
            [ngModel]="direction$ | async"
            (ngModelChange)="onDirectionChange($event)"
          />
          <label for="vertical">Vertical</label><br />
          <input
            type="radio"
            id="horizontal"
            name="direction"
            value="horizontal"
            [ngModel]="direction$ | async"
            (ngModelChange)="onDirectionChange($event)"
          />
          <label for="horizontal">Horizontal</label><br />
        </fieldset>

        <button (click)="onOrganize()">Organize</button>
        <button (click)="onAddNode()">Add Node</button>

        <p>{{ clientId }}</p>
      </div>
      <div id="cy" class="bp-bg-bricks" #drawerElement></div>
    </div>
  `,
  styles: [
    `
      #cy {
        height: 100%;
        width: calc(100% - 300px);
        position: absolute;
        right: 0;
        top: 0;
        overflow: hidden;
      }

      #sidebar {
        width: 300px;
        height: 100%;
        border-right: 1px solid black;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [provideComponentStore(DrawerStore)],
})
export class AppComponent implements AfterViewInit {
  private readonly _drawerStore = inject(DrawerStore);
  private readonly _eventApiService = inject(EventApiService);
  private readonly _graphApiService = inject(GraphApiService);

  readonly drawMode$ = this._drawerStore.drawMode$;
  readonly direction$ = this._drawerStore.direction$;

  readonly clientId = uuid();
  readonly graphId = '5l7hFOgMPmJ1SBcZChwe';

  @ViewChild('drawerElement') drawerElementRef: ElementRef<HTMLElement> | null =
    null;

  ngAfterViewInit() {
    if (this.drawerElementRef !== null) {
      this._drawerStore.setElementRef(this.drawerElementRef);

      this._graphApiService.getGraph(this.graphId).then((graph) => {
        if (graph !== null) {
          this._drawerStore.setNodes(graph.nodes);
          this._drawerStore.setEdges(graph.edges);

          this._eventApiService.onServerCreate(
            this.clientId,
            this.graphId,
            graph.lastEventId,
            (event) => {
              console.log('server event', event);

              switch (event.type) {
                case 'AddNodeSuccess': {
                  this._drawerStore.handleNodeAdded(event.payload);
                  break;
                }
                case 'DeleteNodeSuccess': {
                  this._drawerStore.handleNodeRemoved(event.payload);
                  break;
                }
                case 'AddEdgeSuccess': {
                  this._drawerStore.handleEdgeAdded(event.payload);
                  break;
                }
                case 'DeleteEdgeSuccess': {
                  this._drawerStore.handleEdgeRemoved(event.payload);
                  break;
                }
                case 'AddNodeToEdgeSuccess': {
                  this._drawerStore.handleNodeAddedToEdge(event.payload);
                  break;
                }
              }
            }
          );
        }
      });

      this._drawerStore.event$
        .pipe(
          concatMap((event) => {
            console.log('local event', event);

            switch (event.type) {
              // Ignoring these events for now
              case 'DeleteEdge':
              case 'DeleteNode':
              case 'Init':
              case 'ViewNode':
              case 'UpdateNode':
                return EMPTY;
              default: {
                return this._eventApiService.emit(
                  this.clientId,
                  this.graphId,
                  event
                );
              }
            }
          })
        )
        .subscribe();
    }
  }

  onDrawModeChange(drawMode: boolean) {
    this._drawerStore.setDrawMode(drawMode);
  }

  onDirectionChange(direction: Direction) {
    this._drawerStore.setDirection(direction);
  }

  onOrganize() {
    this._drawerStore.restartLayout();
  }

  onAddNode() {
    this._drawerStore.addNode({
      id: uuid(),
      kind: 'TokenProgram',
      label: 'INIT ACCOUNT 2',
      image: 'url(assets/images/create-nonce-account.png)'
    });
  }
}
