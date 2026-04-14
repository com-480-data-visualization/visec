// ── Data ────────────────────────────────────────────────────────────────
const timelineData = [
  {year:2000,count:3},{year:2001,count:6},{year:2002,count:1},{year:2003,count:2},
  {year:2004,count:4},{year:2005,count:4},{year:2006,count:14},{year:2007,count:30},
  {year:2008,count:30},{year:2009,count:31},{year:2010,count:32},{year:2011,count:141},
  {year:2012,count:119},{year:2013,count:148},{year:2014,count:108},{year:2015,count:131},
  {year:2016,count:166},{year:2017,count:139},{year:2018,count:122},{year:2019,count:92},
  {year:2020,count:78},{year:2021,count:177},{year:2022,count:377},{year:2023,count:750},
  {year:2024,count:796},{year:2025,count:671}
];

const targetsData = [
  {label:"United States",count:1476},{label:"Russia",count:391},
  {label:"Germany",count:308},{label:"France",count:298},
  {label:"United Kingdom",count:249},{label:"Ukraine",count:233},
  {label:"Spain",count:223},{label:"Italy",count:218},
  {label:"Israel",count:197},{label:"India",count:175}
];

const typesData = [
  {label:"Hijacking with Misuse",count:2591},{label:"Disruption",count:1869},
  {label:"Data theft",count:1725},{label:"Ransomware",count:760},
  {label:"Data theft & Doxing",count:513},{label:"Hijacking without Misuse",count:476}
];

const pairsData = [
  {label:"China → United States",count:238},
  {label:"Russia → Ukraine",count:225},
  {label:"Ukraine → Russia",count:194},
  {label:"Russia → United States",count:159},
  {label:"North Korea → South Korea",count:89},
  {label:"Russia → Italy",count:83},
  {label:"Iran → Israel",count:82},
  {label:"Iran → United States",count:82},
  {label:"Russia → Spain",count:68},
  {label:"Russia → France",count:63},
  {label:"Russia → Germany",count:58},
  {label:"China → Taiwan",count:53}
];

// ── Shared palette & helpers ────────────────────────────────────────────
const ACCENT = "#0f5c94";
const ACCENT2 = "#8c2f39";
const MUTED  = "#5d6975";
const LINE_C = "#d8d1c7";

function createTooltip() {
  return d3.select("body").append("div")
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

// ── Metrics ─────────────────────────────────────────────────────────────
function renderMetrics() {
  const metrics = [
    { label: "Time span", value: "2000–2025", caption: "26 years of recorded cyber operations." },
    { label: "Incidents", value: "4,374", caption: "Documented cyber incidents worldwide." },
    { label: "Countries", value: "211", caption: "Distinct countries appearing as targets." },
    { label: "Peak year", value: "2024", caption: "796 incidents — the highest on record." }
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

// ── 1. Timeline line chart ──────────────────────────────────────────────
function renderTimeline() {
  const container = document.getElementById("evolution-chart");
  if (!container) return;
  container.innerHTML = "";

  const rect = container.getBoundingClientRect();
  const margin = { top: 20, right: 24, bottom: 40, left: 52 };
  const width  = Math.max(rect.width, 300) - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(timelineData, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(timelineData, d => d.count) * 1.08])
    .range([height, 0]);

  // Grid lines
  svg.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .selectAll("line").attr("stroke", LINE_C).attr("stroke-dasharray", "3,3");
  svg.selectAll(".grid .domain").remove();

  // Axes
  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
    .selectAll("text").attr("fill", MUTED).style("font-size", "0.82rem");

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text").attr("fill", MUTED).style("font-size", "0.82rem");

  svg.selectAll(".domain").attr("stroke", LINE_C);
  svg.selectAll(".tick line").attr("stroke", LINE_C);

  // Area
  const area = d3.area()
    .x(d => x(d.year)).y0(height).y1(d => y(d.count))
    .curve(d3.curveMonotoneX);
  svg.append("path").datum(timelineData)
    .attr("fill", ACCENT).attr("fill-opacity", 0.08).attr("d", area);

  // Line
  const line = d3.line()
    .x(d => x(d.year)).y(d => y(d.count))
    .curve(d3.curveMonotoneX);
  svg.append("path").datum(timelineData)
    .attr("fill", "none").attr("stroke", ACCENT).attr("stroke-width", 2.5).attr("d", line);

  // Dots + tooltip
  const tip = createTooltip();
  svg.selectAll(".dot").data(timelineData).enter().append("circle")
    .attr("cx", d => x(d.year)).attr("cy", d => y(d.count))
    .attr("r", 4).attr("fill", ACCENT).attr("stroke", "#fff").attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(150).attr("r", 7);
      tip.transition().duration(150).style("opacity", 1);
      tip.html(`<strong>${d.year}</strong><br>${d.count} incidents`)
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 32) + "px");
    })
    .on("mousemove", function(event) {
      tip.style("left", (event.pageX + 12) + "px").style("top", (event.pageY - 32) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).transition().duration(150).attr("r", 4);
      tip.transition().duration(200).style("opacity", 0);
    });

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("fill", MUTED).style("font-size", "0.82rem")
    .text("Number of incidents");
}

// ── 2/3/4. Horizontal bar chart (reusable) ──────────────────────────────
function renderBarChart(containerId, data, color) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const rect = container.getBoundingClientRect();
  const margin = { top: 8, right: 50, bottom: 28, left: 160 };
  const barH = 30;
  const gap = 6;
  const height = data.length * (barH + gap) - gap;
  const width  = Math.max(rect.width, 300) - margin.left - margin.right;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) * 1.05])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.15);

  // Grid
  svg.append("g").attr("class", "grid")
    .call(d3.axisBottom(x).ticks(5).tickSize(height).tickFormat(""))
    .attr("transform", "translate(0,0)")
    .selectAll("line").attr("stroke", LINE_C).attr("stroke-dasharray", "3,3");
  svg.selectAll(".grid .domain").remove();

  // Bars
  const tip = createTooltip();

  svg.selectAll(".bar").data(data).enter().append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.label))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", color)
    .attr("rx", 4)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(150).attr("fill-opacity", 0.75);
      tip.transition().duration(150).style("opacity", 1);
      tip.html(`<strong>${d.label}</strong><br>${d.count.toLocaleString()} incidents`)
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 32) + "px");
    })
    .on("mousemove", function(event) {
      tip.style("left", (event.pageX + 12) + "px").style("top", (event.pageY - 32) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).transition().duration(150).attr("fill-opacity", 1);
      tip.transition().duration(200).style("opacity", 0);
    })
    .transition().duration(700).ease(d3.easeCubicOut)
    .attr("width", d => x(d.count));

  // Value labels
  svg.selectAll(".val").data(data).enter().append("text")
    .attr("x", d => x(d.count) + 6)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("fill", MUTED).style("font-size", "0.8rem").style("font-weight", "600")
    .text(d => d.count.toLocaleString());

  // Y-axis labels
  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text").attr("fill", "#18212b").style("font-size", "0.85rem");
  svg.selectAll(".domain").remove();
}

// ── Render everything ───────────────────────────────────────────────────
renderMetrics();
renderTimeline();
renderBarChart("targets-chart", targetsData, ACCENT);
renderBarChart("initiators-chart", typesData, ACCENT2);
renderBarChart("relationships-chart", pairsData, "#4a3f6b");

// Redraw on resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderTimeline();
    renderBarChart("targets-chart", targetsData, ACCENT);
    renderBarChart("initiators-chart", typesData, ACCENT2);
    renderBarChart("relationships-chart", pairsData, "#4a3f6b");
  }, 200);
});
