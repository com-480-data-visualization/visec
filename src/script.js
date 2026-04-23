const DATA_PATH = "../data/cyber_incidents_ref.csv";

const PROJECT_YEAR_MIN = 2000;
const PROJECT_YEAR_MAX = 2025;

const ACCENT = "#0f5c94";
const ACCENT2 = "#8c2f39";
const ACCENT3 = "#4a3f6b";
const MUTED = "#5d6975";
const LINE_C = "#d8d1c7";

const MISSING_VALUES = new Set([
  "",
  "Not available",
  "Unknown",
  "nan",
  "NaN",
  "NULL",
  "null",
  null,
  undefined
]);

let incidents = [];

const state = {
  yearRange: [PROJECT_YEAR_MIN, PROJECT_YEAR_MAX],
  selectedCountry: null
};

const countryAliases = {
  "Korea, Republic of": "South Korea",
  "Korea, Democratic People's Republic of": "North Korea",
  "Iran, Islamic Republic of": "Iran",
  "Russian Federation": "Russia",
  "Viet Nam": "Vietnam",
  "Syrian Arab Republic": "Syria",
  "Moldova, Republic of": "Moldova",
  "Venezuela, Bolivarian Republic of": "Venezuela",
  "Taiwan, Province of China": "Taiwan",
  "Lao People's Democratic Republic": "Laos",
  "Brunei Darussalam": "Brunei",
  "Türkiye": "Turkey",
  "United States of America": "United States",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom"
};

function normalizeCountry(name) {
  const value = String(name || "").trim();
  if (!value || MISSING_VALUES.has(value)) return null;
  return countryAliases[value] || value;
}

function parseYear(value) {
  const raw = String(value || "").trim();
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) ? year : null;
}

function splitValues(value, { normalize = false, keepDuplicates = true } = {}) {
  if (value === null || value === undefined) return [];

  const parts = String(value)
    .split(";")
    .map(d => d.trim())
    .filter(Boolean)
    .map(d => (normalize ? normalizeCountry(d) : d))
    .filter(d => d && !MISSING_VALUES.has(d));

  return keepDuplicates ? parts : [...new Set(parts)];
}

function buildIncident(row, index) {
  const year = parseYear(row.start_date);
  if (!year || year < PROJECT_YEAR_MIN || year > PROJECT_YEAR_MAX) return null;

  return {
    id: index,
    year,
    targetCountries: splitValues(row.receiver_country, {
      normalize: true,
      keepDuplicates: true
    }),
    incidentTypes: splitValues(row.incident_type, {
      normalize: false,
      keepDuplicates: true
    }),
    initiatorCountries: splitValues(row.initiator_country, {
      normalize: true,
      keepDuplicates: false
    })
  };
}

function getTimeFilteredIncidents() {
  const [start, end] = state.yearRange;
  return incidents.filter(d => d.year >= start && d.year <= end);
}

function getCountryFilteredIncidents() {
  const rows = getTimeFilteredIncidents();
  if (!state.selectedCountry) return rows;
  return rows.filter(d => d.targetCountries.includes(state.selectedCountry));
}

function countBy(values) {
  const map = new Map();
  values.forEach(value => {
    map.set(value, (map.get(value) || 0) + 1);
  });
  return map;
}

function buildTimelineSeries() {
  const base = d3.range(PROJECT_YEAR_MIN, PROJECT_YEAR_MAX + 1).map(year => ({
    year,
    count: 0
  }));

  const counts = d3.rollup(
    incidents,
    v => v.length,
    d => d.year
  );

  base.forEach(d => {
    d.count = counts.get(d.year) || 0;
  });

  return base;
}

function buildTargetData() {
  const rows = getTimeFilteredIncidents();
  const values = [];

  rows.forEach(row => {
    row.targetCountries.forEach(country => values.push(country));
  });

  return Array.from(countBy(values), ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function buildTypeData() {
  const rows = getCountryFilteredIncidents();
  const values = [];

  rows.forEach(row => {
    row.incidentTypes.forEach(type => values.push(type));
  });

  return Array.from(countBy(values), ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function buildPairData() {
  const rows = getCountryFilteredIncidents();
  const counts = new Map();

  rows.forEach(row => {
    if (!row.initiatorCountries.length || !row.targetCountries.length) return;

    const targets = state.selectedCountry
      ? row.targetCountries.filter(t => t === state.selectedCountry)
      : row.targetCountries;

    if (!targets.length) return;

    row.initiatorCountries.forEach(initiator => {
      targets.forEach(target => {
        const key = `${initiator} → ${target}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
  });

  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function createTooltip() {
  let tooltip = d3.select("body").select(".d3-tooltip");

  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("background", "#18212b")
      .style("color", "#f5f0e8")
      .style("padding", "8px 14px")
      .style("border-radius", "10px")
      .style("font-size", "0.88rem")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 16px rgba(0,0,0,0.18)")
      .style("z-index", "100")
      .style("white-space", "nowrap");
  }

  return tooltip;
}

const tooltip = createTooltip();

function showTooltip(event, html) {
  tooltip
    .style("opacity", 1)
    .html(html)
    .style("left", `${event.pageX + 12}px`)
    .style("top", `${event.pageY - 32}px`);
}

function moveTooltip(event) {
  tooltip
    .style("left", `${event.pageX + 12}px`)
    .style("top", `${event.pageY - 32}px`);
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}

function renderMetrics() {
  const timeRows = getTimeFilteredIncidents();
  const countryRows = getCountryFilteredIncidents();

  const uniqueCountries = new Set();
  timeRows.forEach(row => row.targetCountries.forEach(c => uniqueCountries.add(c)));

  const timeline = buildTimelineSeries().filter(
    d => d.year >= state.yearRange[0] && d.year <= state.yearRange[1]
  );

  const peak = timeline.reduce((best, cur) => (cur.count > best.count ? cur : best), timeline[0]);

  const metrics = [
    {
      label: "Time window",
      value: `${state.yearRange[0]}–${state.yearRange[1]}`,
      caption: "Controlled with the timeline brush."
    },
    {
      label: "Incidents in window",
      value: timeRows.length.toLocaleString(),
      caption: "Counted directly from the refactored CSV."
    },
    {
      label: "Target countries",
      value: uniqueCountries.size.toLocaleString(),
      caption: "Distinct target countries in the selected years."
    },
    state.selectedCountry
      ? {
          label: "Focus country",
          value: state.selectedCountry,
          caption: `${countryRows.length.toLocaleString()} incidents target this country in the selected years.`
        }
      : {
          label: "Peak year",
          value: String(peak.year),
          caption: `${peak.count.toLocaleString()} incidents in the selected time window.`
        }
  ];

  const el = document.getElementById("metrics");
  if (!el) return;

  el.innerHTML = metrics.map(m => `
    <article class="metric">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-caption">${m.caption}</div>
    </article>
  `).join("");
}

function renderTimeline() {
  const container = document.getElementById("evolution-chart");
  if (!container) return;
  container.innerHTML = "";

  const fullSeries = buildTimelineSeries();
  const selectedSeries = fullSeries.filter(
    d => d.year >= state.yearRange[0] && d.year <= state.yearRange[1]
  );

  const rect = container.getBoundingClientRect();
  const margin = { top: 20, right: 24, bottom: 30, left: 52 };
  const width = Math.max(rect.width, 320) - margin.left - margin.right;
  const mainHeight = 260;
  const contextHeight = 70;
  const gap = 56;
  const totalHeight = mainHeight + contextHeight + gap;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${totalHeight + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xMain = d3.scaleLinear()
    .domain(state.yearRange)
    .range([0, width]);

  const xContext = d3.scaleLinear()
    .domain([PROJECT_YEAR_MIN, PROJECT_YEAR_MAX])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(fullSeries, d => d.count) * 1.08])
    .range([mainHeight, 0]);

  const yContext = d3.scaleLinear()
    .domain(y.domain())
    .range([contextHeight, 0]);

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .selectAll("line")
    .attr("stroke", LINE_C)
    .attr("stroke-dasharray", "3,3");

  svg.selectAll(".domain").remove();

  const xAxisMain = d3.axisBottom(xMain).tickFormat(d3.format("d"));
  if (selectedSeries.length <= 8) {
    xAxisMain.tickValues(selectedSeries.map(d => d.year));
  } else {
    xAxisMain.ticks(6);
  }

  svg.append("g")
    .attr("transform", `translate(0,${mainHeight})`)
    .call(xAxisMain)
    .selectAll("text")
    .attr("fill", MUTED)
    .style("font-size", "0.82rem");

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .attr("fill", MUTED)
    .style("font-size", "0.82rem");

  svg.selectAll(".tick line").attr("stroke", LINE_C);

  const area = d3.area()
    .x(d => xMain(d.year))
    .y0(mainHeight)
    .y1(d => y(d.count))
    .curve(d3.curveMonotoneX);

  const line = d3.line()
    .x(d => xMain(d.year))
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(selectedSeries)
    .attr("fill", ACCENT)
    .attr("fill-opacity", 0.08)
    .attr("d", area);

  svg.append("path")
    .datum(selectedSeries)
    .attr("fill", "none")
    .attr("stroke", ACCENT)
    .attr("stroke-width", 2.5)
    .attr("d", line);

  svg.selectAll(".dot")
    .data(selectedSeries)
    .enter()
    .append("circle")
    .attr("cx", d => xMain(d.year))
    .attr("cy", d => y(d.count))
    .attr("r", 4)
    .attr("fill", ACCENT)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(120).attr("r", 7);
      showTooltip(event, `<strong>${d.year}</strong><br>${d.count.toLocaleString()} incidents`);
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", function() {
      d3.select(this).transition().duration(120).attr("r", 4);
      hideTooltip();
    });

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -mainHeight / 2)
    .attr("y", -38)
    .attr("text-anchor", "middle")
    .attr("fill", MUTED)
    .style("font-size", "0.82rem")
    .text("Number of incidents");

  const context = svg.append("g")
    .attr("transform", `translate(0,${mainHeight + gap})`);

  const areaContext = d3.area()
    .x(d => xContext(d.year))
    .y0(contextHeight)
    .y1(d => yContext(d.count))
    .curve(d3.curveMonotoneX);

  const lineContext = d3.line()
    .x(d => xContext(d.year))
    .y(d => yContext(d.count))
    .curve(d3.curveMonotoneX);

  context.append("path")
    .datum(fullSeries)
    .attr("fill", "#d6d0c7")
    .attr("fill-opacity", 0.35)
    .attr("d", areaContext);

  context.append("path")
    .datum(fullSeries)
    .attr("fill", "none")
    .attr("stroke", "#8e8b86")
    .attr("stroke-width", 1.8)
    .attr("d", lineContext);

  context.append("g")
    .attr("transform", `translate(0,${contextHeight})`)
    .call(d3.axisBottom(xContext).ticks(6).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("fill", MUTED)
    .style("font-size", "0.78rem");

  const brush = d3.brushX()
    .extent([[0, 0], [width, contextHeight]])
    .on("end", function(event) {
      if (!event.sourceEvent) return;

      if (!event.selection) {
        state.yearRange = [PROJECT_YEAR_MIN, PROJECT_YEAR_MAX];
        renderAll();
        return;
      }

      let [x0, x1] = event.selection.map(xContext.invert);
      let start = Math.round(x0);
      let end = Math.round(x1);

      start = Math.max(PROJECT_YEAR_MIN, Math.min(start, PROJECT_YEAR_MAX));
      end = Math.max(PROJECT_YEAR_MIN, Math.min(end, PROJECT_YEAR_MAX));

      if (start === end) {
        if (end < PROJECT_YEAR_MAX) end += 1;
        else start -= 1;
      }

      if (start > end) [start, end] = [end, start];

      state.yearRange = [start, end];
      renderAll();
    });

  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, state.yearRange.map(xContext));
}

function renderBarChart(containerId, data, color, options = {}) {
  const {
    selectedKey = null,
    clickable = false,
    onClick = null,
    emptyMessage = "No data available.",
    marginLeft = 160
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = `<div style="color:${MUTED};padding:12px 0;">${emptyMessage}</div>`;
    return;
  }

  const rect = container.getBoundingClientRect();
  const margin = { top: 8, right: 56, bottom: 30, left: marginLeft };
  const width = Math.max(rect.width, 320) - margin.left - margin.right;
  const height = data.length * 34;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) * 1.05])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.16);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(""))
    .selectAll("line")
    .attr("stroke", LINE_C)
    .attr("stroke-dasharray", "3,3");

  svg.selectAll(".domain").remove();

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text")
    .attr("fill", MUTED)
    .style("font-size", "0.8rem");

  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .attr("fill", "#18212b")
    .style("font-size", "0.84rem");

  const bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.label))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", color)
    .attr("rx", 4)
    .attr("fill-opacity", d => {
      if (!selectedKey) return 1;
      return d.label === selectedKey ? 1 : 0.28;
    })
    .style("cursor", clickable ? "pointer" : "default")
    .on("mouseover", function(event, d) {
      showTooltip(event, `<strong>${d.label}</strong><br>${d.count.toLocaleString()} incidents`);
      d3.select(this).transition().duration(120).attr("fill-opacity", 0.78);
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", function(_, d) {
      hideTooltip();
      d3.select(this).transition().duration(120).attr(
        "fill-opacity",
        selectedKey ? (d.label === selectedKey ? 1 : 0.28) : 1
      );
    });

  if (clickable && typeof onClick === "function") {
    bars.on("click", (_, d) => onClick(d));
  }

  bars.transition()
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.count));

  svg.selectAll(".val")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => x(d.count) + 6)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("fill", MUTED)
    .style("font-size", "0.8rem")
    .style("font-weight", "600")
    .text(d => d.count.toLocaleString());
}

function renderTargetsChart() {
  const data = buildTargetData();

  renderBarChart("targets-chart", data, ACCENT, {
    selectedKey: state.selectedCountry,
    clickable: true,
    marginLeft: 160,
    onClick: d => {
      state.selectedCountry = state.selectedCountry === d.label ? null : d.label;
      renderAll();
    },
    emptyMessage: "No target-country data available."
  });
}

function renderTypesChart() {
  const data = buildTypeData();

  renderBarChart("initiators-chart", data, ACCENT2, {
    marginLeft: 200,
    emptyMessage: state.selectedCountry
      ? `No incident-type data for ${state.selectedCountry} in the selected years.`
      : "No incident-type data available."
  });
}

function renderRelationshipsChart() {
  const data = buildPairData();

  renderBarChart("relationships-chart", data, ACCENT3, {
    marginLeft: 210,
    emptyMessage: state.selectedCountry
      ? `No attacker–target pairs found for ${state.selectedCountry} in the selected years.`
      : "No relationship data available."
  });
}

function initScrollSpy() {
  const links = [...document.querySelectorAll(".nav a")];
  const sections = links
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (!visible) return;

      const currentId = `#${visible.target.id}`;
      links.forEach(link => {
        const active = link.getAttribute("href") === currentId;
        link.style.background = active ? "var(--surface-alt)" : "";
        link.style.color = active ? "var(--text)" : "";
      });
    },
    {
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
}

function renderAll() {
  renderMetrics();
  renderTimeline();
  renderTargetsChart();
  renderTypesChart();
  renderRelationshipsChart();
}

async function init() {
  try {
    const rows = await d3.csv(DATA_PATH);

    incidents = rows
      .map(buildIncident)
      .filter(Boolean);

    if (!incidents.length) {
      throw new Error("CSV loaded, but no usable rows were found.");
    }

    initScrollSpy();
    renderAll();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderAll, 180);
    });
  } catch (error) {
    console.error("App error:", error);

    const ids = [
      "metrics",
      "evolution-chart",
      "targets-chart",
      "initiators-chart",
      "relationships-chart"
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `
          <p style="color:#8c2f39;">
            The CSV was found, but the visualization code crashed.
            Open the browser console to see the exact JavaScript error.
          </p>
        `;
      }
    });
  }
}

init();