function detectDeadlock() {
  fetch('/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      processes: 5,
      resources: 3,
      allocations: [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]],
      requests: [[0,0,0], [2,0,2], [0,0,0], [1,0,0], [0,0,2]]
    })
  })
  .then(res => res.json())
  .then(data => {
    const out = document.getElementById('output');
    if (data.isDeadlocked) {
      out.innerHTML = `<p style="color:red;">Deadlock detected!</p>
        <p>Deadlocked Processes: ${data.deadlockedProcesses.join(', ')}</p>`;
    } else {
      out.innerHTML = `<p style="color:green;">No Deadlock!</p>`;
    }
  })
  .catch(err => console.error(err));
}
function highlightCycle(cyclePath) {
  svg.selectAll("*").remove();

  const highlightedLinks = new Set();
  for (let i = 0; i < cyclePath.length - 1; i++) {
    highlightedLinks.add(`${cyclePath[i]}->${cyclePath[i + 1]}`);
  }

  const link = svg.append("g")
    .attr("stroke", "#aaa")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 3)
    .attr("stroke", d => {
      const key = `${d.source.id || d.source}->${d.target.id || d.target}`;
      return highlightedLinks.has(key) ? "red" : "#aaa";
    });

  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 25)
    .attr("fill", d => cyclePath.includes(d.id) ? "#ff4d4d" : (d.type === "process" ? "#1f77b4" : "#ff7f0e"))
    .call(drag(simulation));

  const label = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em");

  simulation.nodes(nodes).on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

  simulation.force("link").links(links);
  simulation.alpha(1).restart();
}
