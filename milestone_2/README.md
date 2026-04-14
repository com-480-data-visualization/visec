# Milestone 2 — Global Cybersecurity Incidents

## Project Goal

The goal of this project is to build an **interactive data-driven website** that makes the global landscape of cyber incidents accessible, interpretable, and engaging. Using the EuRepoC dataset (4,000+ documented cyber operations worldwide), the final product will allow users to explore **who attacks, who is targeted, what types of incidents dominate, and how cyber activity evolves over time** — all through coordinated, interactive visualizations.

Rather than reproducing the EuRepoC table-based interface, we focus on **visual storytelling**: each section of the website answers one clear analytical question, supported by a purpose-built interactive chart. The website is designed for a broad audience — students, researchers, cybersecurity analysts, and the general public — and prioritizes clarity, narrative, and accessibility over exhaustive filtering.

The final website will consist of **four main interactive sections**, each built around a core visualization, plus a set of coordinated interactions (tooltips, cross-filtering, brushing) that tie them together into a coherent analytical experience.

---

## Visualization Sketches

The following wireframe sketches illustrate the planned visualizations for the final product.

### Overall Website Layout

![Website Layout Wireframe](sketches/sketch_website_layout.png)

The website follows a **scrollytelling** structure: a hero section introduces the project, followed by four analytical sections each pairing explanatory text (left) with an interactive chart (right), and ending with a conclusion. A sticky navigation bar allows direct access to each section.

### Visualization 1 — Interactive Timeline with Brush

![Timeline Sketch](sketches/sketch_timeline_brush.png)

An area/line chart showing **incident counts per year** (2000–2025). The main chart displays the selected time range in detail, while a smaller **brush selector** below lets users drag to narrow the time window. Hovering over a data point reveals a tooltip with the exact count and dominant incident type for that year. The selected time range will **cross-filter** the other visualizations on the page.

### Visualization 2 — Interactive Choropleth World Map

![World Map Sketch](sketches/sketch_world_map.png)

A **choropleth world map** where each country is colored by the number of incidents it received. Hovering over a country displays a tooltip with the country name, incident count, and top incident type. Clicking a country will update a **side panel** showing detailed breakdowns (top initiators, incident type distribution). The map responds to the timeline brush filter.

### Visualization 3 — Interactive Bar Chart (Top Targeted Countries / Incident Types)

![Bar Chart Sketch](sketches/sketch_bar_chart.png)

A **horizontal bar chart** ranking the top 10 targeted countries (or top incident types, togglable). Hovering highlights the bar and shows a tooltip with details. Clicking a bar cross-filters the other charts to show data only for that country or type. Bars animate on load and update with smooth transitions when filters change.

### Visualization 4 — Chord Diagram (Attacker–Target Flows)

![Chord Diagram Sketch](sketches/sketch_chord_diagram.png)

A **chord diagram** showing the most prominent attacker-to-target country relationships. Each arc segment represents a country; chords connecting them encode the volume of incidents from initiator to target. Hovering over a chord highlights the relationship and displays a tooltip. This visualization replaces the static bar chart of pairs from Milestone 1 with a far more expressive representation of bilateral flows.

---

## Tools and Lectures

| Visualization | Tools | Relevant Lectures |
|---|---|---|
| **Interactive Timeline + Brush** | D3.js (d3-scale, d3-axis, d3-brush, d3-shape, d3-transition) | *TODO: fill in from your COM-480 syllabus* |
| **Choropleth World Map** | D3.js (d3-geo, d3-geo-projection), TopoJSON, GeoJSON (Natural Earth) | *TODO* |
| **Interactive Bar Chart** | D3.js (d3-scale, d3-axis, d3-transition) | *TODO* |
| **Chord Diagram** | D3.js (d3-chord, d3-ribbon) | *TODO* |
| **Cross-filtering / Coordination** | D3.js (d3-dispatch), custom event bus | *TODO* |
| **Website skeleton & styling** | HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript | *TODO* |
| **Data preprocessing** | Python (Pandas), CSV → JSON conversion | *TODO* |

---

## Implementation Breakdown

### Core Visualizations — Minimal Viable Product (MVP)

These components form the **essential deliverable**. Each is independent and can be developed in parallel.

| # | Component | Description | Priority |
|---|---|---|---|
| 1 | **Website skeleton + navigation** | Sticky nav bar, hero section, four section containers with text + chart shells, conclusion. Responsive layout. | Done (Milestone 2 prototype) |
| 2 | **Data pipeline (CSV → JSON)** | Python script converting the cleaned CSV into optimized JSON files for each visualization (yearly counts, country aggregates, pair matrices). | High |
| 3 | **Interactive timeline** | D3.js line/area chart with axes, tooltips on hover, and animated transitions on load. | High |
| 4 | **Interactive bar chart** | D3.js horizontal bar chart for top 10 targeted countries with hover highlights and tooltips. | High |
| 5 | **Choropleth world map** | D3.js geo projection rendering countries colored by incident count, with hover tooltips. | High |
| 6 | **Attacker–target bar chart** | D3.js horizontal bar chart showing top 15 initiator → target pairs (baseline version before chord diagram). | High |

### Enhancements — Extra Ideas

These additions **improve the experience** but can be dropped without losing the project's core meaning.

| # | Enhancement | Description | Difficulty |
|---|---|---|---|
| A | **Brush-based time filtering** | Add a D3 brush widget below the timeline; dragging the brush updates all other charts to the selected year range. | Medium |
| B | **Chord diagram** | Replace the attacker–target bar chart with a chord diagram for a more expressive view of bilateral flows. | Medium–Hard |
| C | **Map click → detail panel** | Clicking a country on the map opens a side panel showing top initiators against that country, incident type breakdown, and a mini timeline. | Medium |
| D | **Cross-chart filtering** | Clicking a bar in the bar chart or a country on the map filters all other visualizations. Coordinated views via a shared event dispatcher. | Medium |
| E | **Animated transitions** | Smooth D3 transitions when data updates: bars slide, map recolors gradually, chords morph. | Low–Medium |
| F | **Incident type toggle** | A toggle button on the bar chart section to switch between "Top targeted countries" and "Top incident types" views. | Low |
| G | **Stacked area chart** | Replace or supplement the timeline with a stacked area chart breaking down incident counts by type over time. | Medium |
| H | **Dark mode** | A theme toggle in the nav bar switching between the current light palette and a dark palette. | Low |

---

## Functional Prototype

The current prototype is available in the `src/` directory and can be opened directly in a browser (`src/index.html`).

### What is already working

- **Full website skeleton**: sticky navigation bar, hero section with project introduction, four analytical sections each with explanatory text and chart containers, and a conclusion section.
- **Responsive design**: the layout adapts to desktop, tablet, and mobile screen widths using CSS Grid and media queries.
- **Editorial design system**: consistent use of cards, section tags, key-takeaway boxes, and a muted warm color palette inspired by *Our World in Data* and the *Financial Times Visual Vocabulary*.
- **Four chart sections** populated with static exploratory charts (PNG images generated in Milestone 1) as placeholders:
  1. Evolution of cyber incidents over time (line chart)
  2. Top 10 targeted countries (horizontal bar chart)
  3. Top 10 incident types (horizontal bar chart)
  4. Most frequent attacker–target relationships (horizontal bar chart)
- **Summary metrics row**: four metric cards displaying the analytical dimensions (Time, Geography, Incident Types, Actors).

### What will change for Milestone 3

The static PNG images will be **replaced by fully interactive D3.js visualizations**. The data pipeline will shift from Python-generated images to JSON data files consumed directly by JavaScript. Cross-chart interactions and tooltips will be added progressively, following the MVP-first, enhancements-second strategy described above.
