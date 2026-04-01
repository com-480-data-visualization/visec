function renderMetrics() {
    const metrics = [
      {
        label: "Time",
        value: "2000–2025",
        caption: "Long-term evolution of recorded cyber incidents."
      },
      {
        label: "Geography",
        value: "Target countries",
        caption: "Countries most frequently affected by incidents."
      },
      {
        label: "Incident characteristics",
        value: "Top incident types",
        caption: "Most common forms of cyber activity."
      },
      {
        label: "Actors",
        value: "Country pairs",
        caption: "Most frequent initiator–target relationships."
      }
    ];
  
    const metricsContainer = document.getElementById("metrics");
    if (!metricsContainer) return;
  
    metricsContainer.innerHTML = metrics.map(item => `
      <article class="metric">
        <div class="metric-label">${item.label}</div>
        <div class="metric-value">${item.value}</div>
        <div class="metric-caption">${item.caption}</div>
      </article>
    `).join("");
  }
  
  function renderChartImage(containerId, imagePath, altText) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    container.innerHTML = `
      <img src="${imagePath}" alt="${altText}" class="chart-image">
    `;
  }
  
  renderMetrics();
  
  renderChartImage(
    "evolution-chart",
    "image/incidents_over_time.png",
    "Evolution of cyber incidents over time"
  );
  
  renderChartImage(
    "targets-chart",
    "image/top_target_countries.png",
    "Top 10 countries targeted by cyber incidents"
  );
  
  renderChartImage(
    "initiators-chart",
    "image/top_incident_types_split.png",
    "Top 10 incident types"
  );
  
  renderChartImage(
    "relationships-chart",
    "image/top_attack_pairs.png",
    "Most frequent cyber incident relationships"
  );