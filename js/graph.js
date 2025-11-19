class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList = new Map();
    }

    addNode(id, x, y, label) {
        const node = { id, x, y, label, type: 'normal' };
        this.nodes.push(node);
        this.adjacencyList.set(id, []);
        return node;
    }

    addEdge(from, to, weight) {
        const edge = { from, to, weight };
        this.edges.push(edge);
        
        if (!this.adjacencyList.has(from)) {
            this.adjacencyList.set(from, []);
        }
        this.adjacencyList.get(from).push({ node: to, weight });
        
        if (!this.adjacencyList.has(to)) {
            this.adjacencyList.set(to, []);
        }
        this.adjacencyList.get(to).push({ node: from, weight });
        
        return edge;
    }

    getNode(id) {
        return this.nodes.find(n => n.id === id);
    }

    clear() {
        this.nodes = [];
        this.edges = [];
        this.adjacencyList.clear();
    }
}