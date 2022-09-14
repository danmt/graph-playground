import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

interface Node {
  id: string;
  kind: string;
  label: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

interface Graph {
  id: string;
  nodes: Node[];
  edges: Edge[];
  lastEventId: string;
}

@Injectable({ providedIn: 'root' })
export class GraphApiService {
  private readonly _firestore = inject(Firestore);

  async getGraph(graphId: string): Promise<Graph | null> {
    const graphRef = doc(this._firestore, `graphs/${graphId}`);

    const graph = await getDoc(graphRef);
    const graphData = graph.data();

    if (graphData === undefined) {
      return null;
    }

    return {
      id: graph.id,
      nodes: graphData['nodes'],
      edges: graphData['edges'],
      lastEventId: graphData['lastEventId'],
    };
  }
}
