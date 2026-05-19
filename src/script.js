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

const NAME_TO_ISO = {
  "Afghanistan": 4, "Albania": 8, "Algeria": 12, "Argentina": 32,
  "Armenia": 51, "Australia": 36, "Austria": 40, "Azerbaijan": 31,
  "Bahrain": 48, "Bangladesh": 50, "Belarus": 112, "Belgium": 56,
  "Bolivia": 68, "Bosnia and Herzegovina": 70, "Brazil": 76, "Brunei": 96,
  "Bulgaria": 100, "Cambodia": 116, "Cameroon": 120, "Canada": 124,
  "Chile": 152, "China": 156, "Colombia": 170, "Costa Rica": 188,
  "Croatia": 191, "Cuba": 192, "Cyprus": 196, "Czech Republic": 203,
  "Denmark": 208, "Ecuador": 218, "Egypt": 818, "El Salvador": 222,
  "Estonia": 233, "Ethiopia": 231, "Finland": 246, "France": 250,
  "Georgia": 268, "Germany": 276, "Ghana": 288, "Greece": 300,
  "Guatemala": 320, "Honduras": 340, "Hungary": 348, "Iceland": 352,
  "India": 356, "Indonesia": 360, "Iran": 364, "Iraq": 368,
  "Ireland": 372, "Israel": 376, "Italy": 380, "Japan": 392,
  "Jordan": 400, "Kazakhstan": 398, "Kenya": 404, "Kuwait": 414,
  "Kyrgyzstan": 417, "Laos": 418, "Latvia": 428, "Lebanon": 422,
  "Libya": 434, "Lithuania": 440, "Luxembourg": 442, "Malaysia": 458,
  "Mexico": 484, "Moldova": 498, "Montenegro": 499, "Morocco": 504,
  "Myanmar": 104, "Nepal": 524, "Netherlands": 528, "New Zealand": 554,
  "Nicaragua": 558, "Nigeria": 566, "North Korea": 408, "North Macedonia": 807,
  "Norway": 578, "Oman": 512, "Pakistan": 586, "Palestine": 275,
  "Panama": 591, "Peru": 604, "Philippines": 608, "Poland": 616,
  "Portugal": 620, "Qatar": 634, "Romania": 642, "Russia": 643,
  "Saudi Arabia": 682, "Serbia": 688, "Singapore": 702, "Slovakia": 703,
  "Slovenia": 705, "Somalia": 706, "South Africa": 710, "South Korea": 410,
  "South Sudan": 728, "Spain": 724, "Sri Lanka": 144, "Sudan": 736,
  "Sweden": 752, "Switzerland": 756, "Syria": 760, "Taiwan": 158,
  "Tajikistan": 762, "Tanzania": 834, "Thailand": 764, "Tunisia": 788,
  "Turkey": 792, "Turkmenistan": 795, "Uganda": 800, "Ukraine": 804,
  "United Arab Emirates": 784, "United Kingdom": 826, "United States": 840,
  "Uruguay": 858, "Uzbekistan": 860, "Venezuela": 862, "Vietnam": 704,
  "Yemen": 887, "Zimbabwe": 716
};

const ISO_TO_NAME = Object.fromEntries(
  Object.entries(NAME_TO_ISO).map(([name, iso]) => [iso, name])
);

let worldData = null;
let incidents = [];

const state = {
  yearRange: [PROJECT_YEAR_MIN, PROJECT_YEAR_MAX],
  selectedCountry: null,
  selectedRelationship: null
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

function buildGlobalPairData() {
  const rows = getTimeFilteredIncidents();
  const counts = new Map();

  rows.forEach(row => {
    if (!row.initiatorCountries.length || !row.targetCountries.length) return;

    row.initiatorCountries.forEach(initiator => {
      row.targetCountries.forEach(target => {
        if (!initiator || !target || initiator === target) return;
        const key = `${initiator} → ${target}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
  });

  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function buildCountryRelationshipSides(country) {
  const rows = getTimeFilteredIncidents();
  const incomingCounts = new Map();
  const outgoingCounts = new Map();

  rows.forEach(row => {
    const isTargeted = row.targetCountries.includes(country);
    const isInitiator = row.initiatorCountries.includes(country);

    if (isTargeted) {
      row.initiatorCountries.forEach(initiator => {
        if (!initiator || initiator === country) return;
        incomingCounts.set(initiator, (incomingCounts.get(initiator) || 0) + 1);
      });
    }

    if (isInitiator) {
      row.targetCountries.forEach(target => {
        if (!target || target === country) return;
        outgoingCounts.set(target, (outgoingCounts.get(target) || 0) + 1);
      });
    }
  });

  return {
    incoming: Array.from(incomingCounts, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),

    outgoing: Array.from(outgoingCounts, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  };
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
        state.selectedRelationship = null;
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
      state.selectedRelationship = null;
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
      state.selectedRelationship = null;
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

function updateCountryDetail() {
  const el = document.getElementById("country-detail");
  if (!el) return;

  if (!state.selectedCountry) {
    el.textContent = "Click a country bar to keep it selected and update the relationships chart.";
    return;
  }

  const country = state.selectedCountry;
  const { incoming, outgoing } = buildCountryRelationshipSides(country);
  const rows = getTimeFilteredIncidents();

  const targetedCount = rows.filter(row => row.targetCountries.includes(country)).length;
  const initiatedCount = rows.filter(row => row.initiatorCountries.includes(country)).length;

  const topAttacker = incoming[0];
  const topTarget = outgoing[0];

  let html = `<strong>${country}</strong> appears as a target in <strong>${targetedCount.toLocaleString()}</strong> incidents`;
  html += ` and as an initiator in <strong>${initiatedCount.toLocaleString()}</strong> incidents.`;

  if (topAttacker) {
    html += `<br>Main attacker: <strong>${topAttacker.label}</strong> (${topAttacker.count.toLocaleString()})`;
  }

  if (topTarget) {
    html += `<br>Main target: <strong>${topTarget.label}</strong> (${topTarget.count.toLocaleString()})`;
  }

  el.innerHTML = html;
}

function updateRelationshipDetail() {
  const el = document.getElementById("relationship-detail");
  if (!el) return;

  if (!state.selectedRelationship) {
    if (state.selectedCountry) {
      el.innerHTML = `Click a bar on the left to see <strong>who attacks ${state.selectedCountry}</strong>, or a bar on the right to see <strong>who ${state.selectedCountry} attacks</strong>.`;
    } else {
      el.textContent = "Click a relationship bar to display the currently selected pair.";
    }
    return;
  }

  const rel = state.selectedRelationship;

  if (rel.direction === "global") {
    const [from, to] = rel.label.split(" → ");
    el.innerHTML = `<strong>${from}</strong> → <strong>${to}</strong> appears in <strong>${rel.count.toLocaleString()}</strong> incidents in the selected time window.`;
    return;
  }

  if (rel.direction === "incoming") {
    el.innerHTML = `<strong>${rel.label}</strong> attacks <strong>${state.selectedCountry}</strong> in <strong>${rel.count.toLocaleString()}</strong> incidents in the selected time window.`;
    return;
  }

  if (rel.direction === "outgoing") {
    el.innerHTML = `<strong>${state.selectedCountry}</strong> attacks <strong>${rel.label}</strong> in <strong>${rel.count.toLocaleString()}</strong> incidents in the selected time window.`;
  }
}

function renderCountryRelationshipView(containerId, country) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const { incoming, outgoing } = buildCountryRelationshipSides(country);

  const incomingValid =
    state.selectedRelationship &&
    state.selectedRelationship.direction === "incoming" &&
    incoming.some(d => d.label === state.selectedRelationship.label);

  const outgoingValid =
    state.selectedRelationship &&
    state.selectedRelationship.direction === "outgoing" &&
    outgoing.some(d => d.label === state.selectedRelationship.label);

  if (state.selectedRelationship && !incomingValid && !outgoingValid) {
    state.selectedRelationship = null;
  }

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = window.innerWidth <= 900 ? "1fr" : "1fr 1fr";
  wrapper.style.gap = "18px";
  wrapper.style.alignItems = "start";

  const incomingPanel = document.createElement("div");
  incomingPanel.innerHTML = `
    <div style="font-size:0.92rem;font-weight:700;margin-bottom:8px;">
      Who attacks ${country}?
    </div>
    <div id="relationships-incoming-chart"></div>
  `;

  const outgoingPanel = document.createElement("div");
  outgoingPanel.innerHTML = `
    <div style="font-size:0.92rem;font-weight:700;margin-bottom:8px;">
      Who does ${country} attack?
    </div>
    <div id="relationships-outgoing-chart"></div>
  `;

  wrapper.appendChild(incomingPanel);
  wrapper.appendChild(outgoingPanel);
  container.appendChild(wrapper);

  renderBarChart("relationships-incoming-chart", incoming, ACCENT3, {
    selectedKey:
      state.selectedRelationship?.direction === "incoming"
        ? state.selectedRelationship.label
        : null,
    clickable: true,
    marginLeft: 130,
    onClick: d => {
      state.selectedRelationship = {
        direction: "incoming",
        label: d.label,
        count: d.count
      };
      renderRelationshipsChart();
    },
    emptyMessage: `No incoming attacker data for ${country} in the selected years.`
  });

  renderBarChart("relationships-outgoing-chart", outgoing, ACCENT, {
    selectedKey:
      state.selectedRelationship?.direction === "outgoing"
        ? state.selectedRelationship.label
        : null,
    clickable: true,
    marginLeft: 130,
    onClick: d => {
      state.selectedRelationship = {
        direction: "outgoing",
        label: d.label,
        count: d.count
      };
      renderRelationshipsChart();
    },
    emptyMessage: `No outgoing target data for ${country} in the selected years.`
  });
}

function renderRelationshipsChart() {
  const title = document.getElementById("relationships-title");
  const status = document.getElementById("relationships-status");

  if (!state.selectedCountry) {
    if (state.selectedRelationship && state.selectedRelationship.direction !== "global") {
      state.selectedRelationship = null;
    }

    if (title) {
      title.textContent = "Most frequent cyber incident relationships";
    }

    if (status) {
      status.textContent = "Click a country in Section 2 to split this view into incoming vs outgoing relationships.";
    }

    const data = buildGlobalPairData();

    const globalValid =
      state.selectedRelationship &&
      state.selectedRelationship.direction === "global" &&
      data.some(d => d.label === state.selectedRelationship.label);

    if (state.selectedRelationship && !globalValid) {
      state.selectedRelationship = null;
    }

    renderBarChart("relationships-chart", data, ACCENT3, {
      selectedKey:
        state.selectedRelationship?.direction === "global"
          ? state.selectedRelationship.label
          : null,
      clickable: true,
      marginLeft: 210,
      onClick: d => {
        state.selectedRelationship = {
          direction: "global",
          label: d.label,
          count: d.count
        };
        renderRelationshipsChart();
      },
      emptyMessage: "No relationship data available."
    });
  } else {
    if (title) {
      title.textContent = `Attack relationships for ${state.selectedCountry}`;
    }

    if (status) {
      status.textContent = `Left: who attacks ${state.selectedCountry} · Right: who ${state.selectedCountry} attacks.`;
    }

    renderCountryRelationshipView("relationships-chart", state.selectedCountry);
  }

  updateCountryDetail();
  updateRelationshipDetail();
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

function buildCountryMapStats() {
  const rows = getTimeFilteredIncidents();
  const receivedFrom = new Map();
  const sentTo = new Map();

  rows.forEach(row => {
    row.targetCountries.forEach(target => {
      if (!receivedFrom.has(target)) receivedFrom.set(target, new Map());
      row.initiatorCountries.forEach(init => {
        if (init === target) return;
        const m = receivedFrom.get(target);
        m.set(init, (m.get(init) || 0) + 1);
      });
    });

    row.initiatorCountries.forEach(init => {
      if (!sentTo.has(init)) sentTo.set(init, new Map());
      row.targetCountries.forEach(target => {
        if (target === init) return;
        const m = sentTo.get(init);
        m.set(target, (m.get(target) || 0) + 1);
      });
    });
  });

  const stats = new Map();

  new Set([...receivedFrom.keys(), ...sentTo.keys()]).forEach(country => {
    const rf = receivedFrom.get(country) || new Map();
    const st = sentTo.get(country) || new Map();

    const totalReceived = [...rf.values()].reduce((a, b) => a + b, 0);
    const totalSent = [...st.values()].reduce((a, b) => a + b, 0);

    let topAttacker = null;
    let topAttackerCount = 0;
    rf.forEach((count, init) => {
      if (count > topAttackerCount) {
        topAttacker = init;
        topAttackerCount = count;
      }
    });

    let topTarget = null;
    let topTargetCount = 0;
    st.forEach((count, target) => {
      if (count > topTargetCount) {
        topTarget = target;
        topTargetCount = count;
      }
    });

    stats.set(country, {
      totalReceived,
      totalSent,
      topAttacker,
      topAttackerCount,
      topTarget,
      topTargetCount
    });
  });

  return stats;
}

function renderWorldMap() {
  const container = document.getElementById("world-map-chart");
  if (!container || !worldData) return;
  container.innerHTML = "";

  const infoBox = document.getElementById("map-info-box");
  if (infoBox) infoBox.hidden = true;

  const countries = topojson.feature(worldData, worldData.objects.countries);
  const borders = topojson.mesh(worldData, worldData.objects.countries, (a, b) => a !== b);

  const stats = buildCountryMapStats();

  const isoToFeature = new Map();
  countries.features.forEach(f => isoToFeature.set(+f.id, f));

  const nameToFeature = new Map();
  Object.entries(NAME_TO_ISO).forEach(([name, iso]) => {
    const f = isoToFeature.get(iso);
    if (f) nameToFeature.set(name, f);
  });

  const rect = container.getBoundingClientRect();
  const width = Math.max(rect.width || 600, 400);
  const height = Math.round(width * 0.52);

  const projection = d3.geoNaturalEarth1()
    .scale(width / 6.28)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const maxReceived = d3.max([...stats.values()], d => d.totalReceived) || 1;
  const colorScale = d3.scaleSequential([0, maxReceived], d3.interpolate("#dce8f3", ACCENT));

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  const defs = svg.append("defs");

  const MAP_IN = "#e63946";
  const MAP_OUT = "#f4a261";
  const arrowColors = [MAP_IN, MAP_OUT];
  ["arrow-in", "arrow-out"].forEach((id, i) => {
    defs.append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", arrowColors[i]);
  });

  svg.append("path")
    .datum({ type: "Sphere" })
    .attr("fill", "#e8f0f7")
    .attr("d", path);

  function getOriginalFill(d) {
    const name = ISO_TO_NAME[+d.id];
    if (!name) return "#d6d2cc";
    const s = stats.get(name);
    return s && s.totalReceived ? colorScale(s.totalReceived) : "#d6d2cc";
  }

  const countryPaths = svg.selectAll(".country")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", getOriginalFill)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "default");

  const arcLayer = svg.append("g").attr("class", "arc-layer");

  function clearArcs() {
    arcLayer.selectAll("*").remove();
    countryPaths
      .attr("fill", getOriginalFill)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);
  }

  function drawArc(from, to, color, markerId) {
    if (!from || !to) return;
    const [x1, y1] = from;
    const [x2, y2] = to;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;

    const shorten = Math.min(20, len * 0.15);
    const ex = x2 - (dx / len) * shorten;
    const ey = y2 - (dy / len) * shorten;

    const mx = (x1 + ex) / 2;
    const my = (y1 + ey) / 2;
    const offset = len * 0.3;
    const cx = mx + (-dy / len) * offset;
    const cy = my + (dx / len) * offset;

    arcLayer.append("path")
      .attr("d", `M ${x1},${y1} Q ${cx},${cy} ${ex},${ey}`)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("opacity", 0.85)
      .attr("marker-end", `url(#${markerId})`);
  }

  countryPaths
    .on("mouseover", function(event, d) {
      const name = ISO_TO_NAME[+d.id];
      if (!name) return;

      const s = stats.get(name);

      clearArcs();
      d3.select(this)
        .attr("stroke", "#18212b")
        .attr("stroke-width", 2)
        .style("cursor", "pointer");

      const hoveredCentroid = projection(d3.geoCentroid(d));
      if (!hoveredCentroid) return;

      if (s && s.topAttacker && nameToFeature.has(s.topAttacker)) {
        const af = nameToFeature.get(s.topAttacker);
        const ac = projection(d3.geoCentroid(af));
        if (ac) {
          countryPaths.filter(f => f === af).attr("fill", MAP_IN);
          drawArc(ac, hoveredCentroid, MAP_IN, "arrow-in");
        }
      }

      if (s && s.topTarget && nameToFeature.has(s.topTarget)) {
        const tf = nameToFeature.get(s.topTarget);
        const tc = projection(d3.geoCentroid(tf));
        if (tc) {
          countryPaths.filter(f => f === tf).attr("fill", MAP_OUT);
          drawArc(hoveredCentroid, tc, MAP_OUT, "arrow-out");
        }
      }

      if (infoBox) {
        let html = `<strong>${name}</strong>`;
        if (s) {
          if (s.totalReceived) {
            html += `<br><span style="color:#f4a4a8">▲ ${s.totalReceived.toLocaleString()} received</span>`;
            if (s.topAttacker) html += `<br>Top attacker: <strong>${s.topAttacker}</strong> (${s.topAttackerCount})`;
          }
          if (s.totalSent) {
            html += `<br><span style="color:#fcd5b0">▶ ${s.totalSent.toLocaleString()} initiated</span>`;
            if (s.topTarget) html += `<br>Top target: <strong>${s.topTarget}</strong> (${s.topTargetCount})`;
          }
        } else {
          html += `<br><span style="opacity:0.65">No incidents in selected period</span>`;
        }
        infoBox.innerHTML = html;
        infoBox.hidden = false;
      }
    })
    .on("mouseout", function() {
      clearArcs();
      if (infoBox) infoBox.hidden = true;
    });

  svg.append("path")
    .datum(borders)
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.4)
    .attr("d", path);

  const legendW = 130;
  const legendH = 10;
  const lx = width - legendW - 18;
  const ly = height - 44;

  const gradId = "map-choropleth-grad";
  const grad = defs.append("linearGradient").attr("id", gradId);
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#dce8f3");
  grad.append("stop").attr("offset", "100%").attr("stop-color", ACCENT);

  const legend = svg.append("g").attr("transform", `translate(${lx},${ly})`);

  legend.append("text")
    .attr("y", -6)
    .attr("fill", MUTED)
    .style("font-size", "0.74rem")
    .style("font-weight", "700")
    .style("font-family", "Inter, sans-serif")
    .text("Incidents received");

  legend.append("rect")
    .attr("width", legendW)
    .attr("height", legendH)
    .attr("rx", 3)
    .attr("fill", `url(#${gradId})`);

  const legendScale = d3.scaleLinear().domain([0, maxReceived]).range([0, legendW]);
  legend.append("g")
    .attr("transform", `translate(0,${legendH})`)
    .call(d3.axisBottom(legendScale).ticks(3).tickFormat(d3.format(".0s")).tickSize(3))
    .call(g => g.select(".domain").remove())
    .selectAll("text")
    .attr("fill", MUTED)
    .style("font-size", "0.72rem")
    .style("font-family", "Inter, sans-serif");
}

function updateFilterUI() {
  const [start, end] = state.yearRange;
  const timeFiltered = start !== PROJECT_YEAR_MIN || end !== PROJECT_YEAR_MAX;
  const countryFiltered = !!state.selectedCountry;

  const rangePill = document.getElementById("range-pill");
  if (rangePill) rangePill.textContent = `${start}–${end}`;

  const countryPill = document.getElementById("country-pill");
  if (countryPill) {
    countryPill.textContent = state.selectedCountry || "All countries";
    countryPill.classList.toggle("is-muted", !countryFiltered);
  }

  const clearCountryBtn = document.getElementById("clear-country");
  if (clearCountryBtn) clearCountryBtn.hidden = !countryFiltered;

  const timelineStatus = document.getElementById("timeline-status");
  if (timelineStatus) {
    timelineStatus.textContent = timeFiltered
      ? `Showing ${start}–${end} · All other charts are synchronized to this window.`
      : "Brush the overview chart to zoom into a time window.";
  }

  const syncParts = [];
  if (timeFiltered) syncParts.push(`${start}–${end}`);
  if (countryFiltered) syncParts.push(state.selectedCountry);
  const syncLabel = syncParts.length ? `Synced to: ${syncParts.join(" · ")}` : null;

  const targetsStatus = document.getElementById("targets-status");
  if (targetsStatus) {
    targetsStatus.textContent = syncLabel
      ? `${syncLabel} · Hover for values · Click a country to filter.`
      : "Hover for exact values. Click a country to filter the relationships chart.";
  }

  const typesStatus = document.getElementById("types-status");
  if (typesStatus) {
    typesStatus.textContent = syncLabel
      ? `${syncLabel} · This view complements the time and country perspectives.`
      : "Hover for exact values. This view complements the time and country perspectives.";
  }
}

function renderAll() {
  updateFilterUI();
  renderMetrics();
  renderTimeline();
  renderTargetsChart();
  renderTypesChart();
  renderRelationshipsChart();
  renderWorldMap();

  const [start, end] = state.yearRange;
  const active = start !== PROJECT_YEAR_MIN || end !== PROJECT_YEAR_MAX || !!state.selectedCountry;
  if (active) {
    const shells = ["targets-chart", "initiators-chart", "relationships-chart"]
      .map(id => document.getElementById(id)?.closest(".chart-shell"))
      .filter(Boolean);

    shells.forEach(s => s.classList.remove("sync-flash"));
    void document.body.offsetWidth;
    shells.forEach(s => {
      s.classList.add("sync-flash");
      s.addEventListener("animationend", () => s.classList.remove("sync-flash"), { once: true });
    });
  }
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

async function init() {
  try {
    const rows = await d3.csv(DATA_PATH);

    incidents = rows
      .map(buildIncident)
      .filter(Boolean);

    if (!incidents.length) {
      throw new Error("CSV loaded, but no usable rows were found.");
    }

    document.getElementById("reset-filters").addEventListener("click", () => {
      state.yearRange = [PROJECT_YEAR_MIN, PROJECT_YEAR_MAX];
      state.selectedCountry = null;
      state.selectedRelationship = null;
      renderAll();
    });

    document.getElementById("clear-country").addEventListener("click", () => {
      state.selectedCountry = null;
      state.selectedRelationship = null;
      renderAll();
    });

    initScrollSpy();
    renderAll();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderAll, 180);
    });

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(world => {
        worldData = world;
        renderWorldMap();
      })
      .catch(() => {
        const el = document.getElementById("world-map-chart");
        if (el) el.innerHTML = `<p style="color:${MUTED};padding:12px 0;">Map data unavailable.</p>`;
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