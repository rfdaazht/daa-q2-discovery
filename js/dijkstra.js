class Dijkstra {
    constructor(graph) {
        this.graph = graph;
    }

    findShortestPath(startId, endId) {
        const startTime = performance.now();
        
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const pq = [];

        this.graph.nodes.forEach(node => {
            distances.set(node.id, Infinity);
            previous.set(node.id, null);
        });
        
        distances.set(startId, 0);
        pq.push({ id: startId, distance: 0 });

        while (pq.length > 0) {
            pq.sort((a, b) => a.distance - b.distance);
            const current = pq.shift();

            if (visited.has(current.id)) continue;
            visited.add(current.id);

            if (current.id === endId) break;

            const neighbors = this.graph.adjacencyList.get(current.id) || [];
            
            for (const neighbor of neighbors) {
                if (visited.has(neighbor.node)) continue;

                const newDist = distances.get(current.id) + neighbor.weight;
                
                if (newDist < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, newDist);
                    previous.set(neighbor.node, current.id);
                    pq.push({ id: neighbor.node, distance: newDist });
                }
            }
        }

        const path = [];
        let current = endId;
        
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }

        const endTime = performance.now();
        
        return {
            path: path[0] === startId ? path : [],
            distance: distances.get(endId),
            visited: Array.from(visited),
            executionTime: (endTime - startTime).toFixed(3)
        };
    }
}
