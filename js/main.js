class PathFinderApp {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.graph = new Graph();
        this.mode = 'addNode';
        this.nodeIdCounter = 0;
        this.startNode = null;
        this.endNode = null;
        this.selectedNode = null;
        this.tempEdgeStart = null;
        this.result = null;
        this.padding = 40;

        this.setupCanvas();
        this.setupEventListeners();
        this.draw();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }

    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    getNodeAt(x, y) {
        return this.graph.nodes.find(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
        });
    }

    isPositionValid(x, y) {
        return x >= this.padding &&
            x <= this.canvas.width - this.padding &&
            y >= this.padding &&
            y <= this.canvas.height - this.padding;
    }

    handleCanvasClick(e) {
        const pos = this.getMousePos(e);
        const clickedNode = this.getNodeAt(pos.x, pos.y);

        switch (this.mode) {
            case 'addNode':
                if (!clickedNode && this.isPositionValid(pos.x, pos.y)) {
                    const id = this.nodeIdCounter++;
                    this.graph.addNode(id, pos.x, pos.y, String.fromCharCode(65 + id));
                    this.updateStats();
                    this.draw();
                }
                break;

            case 'addEdge':
                if (clickedNode) {
                    if (!this.tempEdgeStart) {
                        this.tempEdgeStart = clickedNode;
                    } else {
                        if (this.tempEdgeStart.id !== clickedNode.id) {
                            const distance = this.calculateDistance(
                                this.tempEdgeStart.x, this.tempEdgeStart.y,
                                clickedNode.x, clickedNode.y
                            );
                            const weight = Math.round(distance / 10);
                            this.graph.addEdge(this.tempEdgeStart.id, clickedNode.id, weight);
                            this.updateStats();
                        }
                        this.tempEdgeStart = null;
                        this.draw();
                    }
                }
                break;

            case 'selectStart':
                if (clickedNode) {
                    if (this.startNode) {
                        this.startNode.type = 'normal';
                    }
                    this.startNode = clickedNode;
                    clickedNode.type = 'start';
                    this.draw();
                }
                break;

            case 'selectEnd':
                if (clickedNode) {
                    if (this.endNode) {
                        this.endNode.type = 'normal';
                    }
                    this.endNode = clickedNode;
                    clickedNode.type = 'end';
                    this.draw();
                }
                break;
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        this.selectedNode = this.getNodeAt(pos.x, pos.y);

        if (this.mode === 'addEdge' && this.tempEdgeStart) {
            this.draw();
            this.ctx.strokeStyle = '#bdbdbd';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.tempEdgeStart.x, this.tempEdgeStart.y);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.tempEdgeStart = null;
        document.getElementById('modeIndicator').textContent =
            `Mode: ${mode.replace(/([A-Z])/g, ' $1').trim()}`;
        this.draw();
    }

    runDijkstra() {
        if (!this.startNode || !this.endNode) {
            alert('Please select both start and end nodes first!');
            return;
        }

        const dijkstra = new Dijkstra(this.graph);
        this.result = dijkstra.findShortestPath(this.startNode.id, this.endNode.id);

        if (this.result.path.length === 0) {
            alert('No path found between the selected nodes!');
            return;
        }

        document.getElementById('shortestDistance').textContent =
            this.result.distance === Infinity ? '∞' : this.result.distance.toFixed(2);
        document.getElementById('executionTime').textContent =
            this.result.executionTime + ' ms';

        this.draw();
    }

    clearAll() {
        this.graph.clear();
        this.startNode = null;
        this.endNode = null;
        this.result = null;
        this.nodeIdCounter = 0;
        this.tempEdgeStart = null;
        document.getElementById('shortestDistance').textContent = '-';
        document.getElementById('executionTime').textContent = '-';
        this.updateStats();
        this.draw();
    }

    updateStats() {
        document.getElementById('nodeCount').textContent = this.graph.nodes.length;
        document.getElementById('edgeCount').textContent = this.graph.edges.length;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.graph.edges.forEach(edge => {
            const fromNode = this.graph.getNode(edge.from);
            const toNode = this.graph.getNode(edge.to);

            let isInPath = false;
            if (this.result && this.result.path.length > 0) {
                for (let i = 0; i < this.result.path.length - 1; i++) {
                    if ((this.result.path[i] === edge.from && this.result.path[i + 1] === edge.to) ||
                        (this.result.path[i] === edge.to && this.result.path[i + 1] === edge.from)) {
                        isInPath = true;
                        break;
                    }
                }
            }

            this.ctx.strokeStyle = isInPath ? '#424242' : '#bdbdbd';
            this.ctx.lineWidth = isInPath ? 4 : 2;
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            this.ctx.stroke();

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(midX - 15, midY - 12, 30, 24);

            this.ctx.fillStyle = isInPath ? '#212121' : '#616161';
            this.ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight, midX, midY);
        });

        this.graph.nodes.forEach(node => {
            let color = '#ffffff';

            if (node.type === 'start') color = '#212121';
            else if (node.type === 'end') color = '#ffdd00';
            else if (this.result && this.result.visited.includes(node.id)) {
                if (this.result.path.includes(node.id)) {
                    color = '#9e9e9e';
                } else {
                    color = '#e0e0e0';
                }
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = '#212121';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            const isLightNode = node.type === 'end' || color === '#ffffff' || color === '#e0e0e0';
            this.ctx.fillStyle = isLightNode ? '#212121' : 'white';
            this.ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, node.x, node.y);
        });

        if (this.tempEdgeStart) {
            this.ctx.strokeStyle = '#757575';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.tempEdgeStart.x, this.tempEdgeStart.y, 25, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}

const app = new PathFinderApp();