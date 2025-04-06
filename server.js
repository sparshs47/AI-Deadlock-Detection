function detectDeadlock() {
  fetch('/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      processes: 3,
      resources: 2,
      allocations: [
        [1, 0], // P0 holds R0
        [0, 1], // P1 holds R1
        [0, 0], // P2 holds nothing
      ],
      requests: [
        [0, 1], // P0 requests R1
        [1, 0], // P1 requests R0
        [1, 0], // P2 requests R0
      ],
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      drawGraph(data);
      const out = document.getElementById('output');
      if (data.isDeadlocked) {
        out.innerHTML = `<p style="color:red;">💥 Deadlock in: P${data.deadlockedProcesses.join(', P')}</p>`;
      } else {
        out.innerHTML = `<p style="color:green;">✅ No deadlock detected</p>`;
      }
    });
}

function drawGraph(data) {
  const svg = d3.select('#graph');
  svg.selectAll('*').remove();

  const processes = data.allocations.map((_, i) => `P${i}`);
  const resources = data.allocations[0].map((_, i) => `R${i}`);
  const nodes = [...processes, ...resources];

  const nodeData = nodes.map((id, i) => ({
    id,
    x: id.startsWith('P') ? 150 : 600,
    y: 100 + (i % processes.length) * 120,
    type: id.startsWith('P') ? 'process' : 'resource',
    deadlocked: data.deadlockedProcesses?.includes(parseInt(id.substring(1))),
  }));

  const edges = [];

  data.allocations.forEach((alloc, p) => {
    alloc.forEach((val, r) => {
      if (val > 0) {
        edges.push({ from: `R${r}`, to: `P${p}`, type: 'alloc' });
      }
    });
  });

  data.requests.forEach((req, p) => {
    req.forEach((val, r) => {
      if (val > 0) {
        edges.push({ from: `P${p}`, to: `R${r}`, type: 'request' });
      }
    });
  });

  // Arrowhead
  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 10).attr("refY", 5)
    .attr("markerWidth", 6).attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10")
    .attr("fill", "#333");

  // Edges
  svg.selectAll('line')
    .data(edges)
    .enter()
    .append('line')
    .attr('x1', d => nodeData.find(n => n.id === d.from).x)
    .attr('y1', d => nodeData.find(n => n.id === d.from).y)
    .attr('x2', d => nodeData.find(n => n.id === d.from).x)
    .attr('y2', d => nodeData.find(n => n.id === d.from).y)
    .attr('stroke', d => d.type === 'alloc' ? 'blue' : 'orange')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)')
    .transition()
    .duration(800)
    .attr('x2', d => nodeData.find(n => n.id === d.to).x)
    .attr('y2', d => nodeData.find(n => n.id === d.to).y);

  // Nodes
  const nodeGroup = svg.selectAll('g')
    .data(nodeData)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  nodeGroup.append(d => {
    if (d.type === 'process') {
      return document.createElementNS("http://www.w3.org/2000/svg", "circle");
    } else {
      return document.createElementNS("http://www.w3.org/2000/svg", "rect");
    }
  })
    .attr('r', 25)
    .attr('width', 50)
    .attr('height', 50)
    .attr('x', d => d.type === 'resource' ? -25 : null)
    .attr('y', d => d.type === 'resource' ? -25 : null)
    .attr('fill', d => d.deadlocked ? 'red' : d.type === 'process' ? 'lightblue' : 'lightgreen')
    .attr('stroke', 'black')
    .style('opacity', 0)
    .transition()
    .duration(800)
    .style('opacity', 1);

  // Labels
  nodeGroup.append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', 5);
}
const express = require('express');
const path = require('path');
const app = express(); // ✅ THIS LINE is the key!

const PORT = 5000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional: API or logging route
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

