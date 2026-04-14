# Milestone 2 — Global Cybersecurity Incidents

## Project Goal

The goal of this project is to build an **interactive data-driven website** that makes the global landscape of cyber incidents accessible, interpretable, and engaging. Using the EuRepoC dataset (4,000+ documented cyber operations worldwide), the final product will allow users to explore **who attacks, who is targeted, what types of incidents dominate, and how cyber activity evolves over time** — all through coordinated, interactive visualizations.

Rather than reproducing the EuRepoC table-based interface, we focus on **visual storytelling**: each section of the website answers one clear analytical question, supported by a purpose-built chart. The website is designed for a broad audience — students, researchers, cybersecurity analysts, and the general public — and prioritizes clarity, narrative, and accessibility over exhaustive filtering.

The website is structured around **four main analytical sections**, each built around a core visualization:

1. **How have cyber incidents evolved over time?** — A line chart showing incident frequency across years, revealing a sharp increase in recent years.
2. **Which countries are targeted most often?** — A horizontal bar chart ranking the top 10 targeted countries, showing that a small number of countries concentrate the majority of incidents.
3. **What types of cyber incidents are most common?** — A horizontal bar chart ranking the top incident types, making dominant forms of cyber activity immediately visible.
4. **Which attacker–target relationships stand out?** — A horizontal bar chart of the most frequent initiator–target country pairs, revealing recurring geopolitical patterns.

Each section pairs explanatory text (providing context and interpretation) with a chart container, and includes a key-takeaway box summarizing the main insight.

---

## Visualization Sketches

The following wireframe sketches illustrate the planned visualizations for the final product.

### Overall Website Layout

![Website Layout Wireframe](sketches/sketch_website_layout.png)

The website follows a **scrollytelling** structure: a hero section introduces the project, followed by four analytical sections each pairing explanatory text (left) with a chart (right), and ending with a conclusion. A sticky navigation bar allows direct access to each section.

### Visualization 1 — Timeline

![Timeline Sketch](sketches/sketch_timeline_brush.png)

A line chart showing **incident counts per year** (2000–2025). Currently implemented as a static chart. In the final version, hovering over a data point could reveal a tooltip with the exact count and dominant incident type for that year. A **brush selector** could be added to let users narrow the time window.

### Visualization 2 — Top Targeted Countries

![Bar Chart Sketch](sketches/sketch_bar_chart.png)

A **horizontal bar chart** ranking the top 10 targeted countries. Currently implemented as a static chart. In the final version, hovering could highlight the bar and show a tooltip with details.

### Visualization 3 — Top Incident Types

A horizontal bar chart ranking the most common incident types. The structure mirrors the targeted countries chart. Currently implemented as a static chart using the same layout.

### Visualization 4 — Attacker–Target Pairs

![Chord Diagram Sketch](sketches/sketch_chord_diagram.png)

Currently implemented as a **horizontal bar chart** showing the most frequent initiator–target country pairs. In the final version, this could be upgraded to a **chord diagram** for a more expressive representation of bilateral flows (see sketch above), but the bar chart version already conveys the core information.

### World Map (Extra Idea)

![World Map Sketch](sketches/sketch_world_map.png)

An optional **choropleth world map** where each country is colored by the number of incidents it received. This is not currently part of the website prototype but could be added as an enhancement to provide a geographic perspective on the data.

---

## Tools and Lectures

| Visualization | Tools | Relevant Lectures |
|---|---|---|
| **Timeline (line chart)** | HTML5, CSS3, JavaScript; static PNG from Python (Matplotlib) | *TODO* |
| **Top Targeted Countries (bar chart)** | HTML5, CSS3, JavaScript; static PNG from Python (Matplotlib) | *TODO* |
| **Top Incident Types (bar chart)** | HTML5, CSS3, JavaScript; static PNG from Python (Matplotlib) | *TODO* |
| **Attacker–Target Pairs (bar chart)** | HTML5, CSS3, JavaScript; static PNG from Python (Matplotlib) | *TODO* |
| **Website skeleton & styling** | HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript | *TODO* |
| **Data preprocessing & chart generation** | Python (Pandas, Matplotlib) | *TODO* |

---

## Implementation Breakdown

### Core Visualizations — Minimal Viable Product (MVP)

These components form the **essential deliverable**. Each is independent and can be developed in parallel.

| # | Component | Description | Status |
|---|---|---|---|
| 1 | **Website skeleton + navigation** | Sticky nav bar, hero section, four section containers with text + chart areas, conclusion. Responsive layout. | Done |
| 2 | **Editorial design system** | Consistent use of cards, section tags, key-takeaway boxes, and a muted warm color palette. | Done |
| 3 | **Timeline chart** | Line chart showing evolution of cyber incidents over time (2000–2025). | Done (static) |
| 4 | **Top targeted countries chart** | Horizontal bar chart ranking the top 10 targeted countries. | Done (static) |
| 5 | **Top incident types chart** | Horizontal bar chart ranking the most common incident types. | Done (static) |
| 6 | **Attacker–target pairs chart** | Horizontal bar chart showing the most frequent initiator–target country pairs. | Done (static) |
| 7 | **Summary metrics row** | Four metric cards displaying the analytical dimensions (Time, Geography, Incident Types, Actors). | Done |

### Enhancements — Extra Ideas

These additions **improve the experience** but can be dropped without losing the project's core meaning.

| # | Enhancement | Description | Difficulty |
|---|---|---|---|
| A | **Interactive tooltips** | Adding hover tooltips to charts showing detailed information (exact count, dominant type, etc.). | Low–Medium |
| B | **Animated transitions** | Smooth transitions when data updates: bars slide, lines animate on load. | Low–Medium |
| C | **Brush-based time filtering** | Add a brush widget below the timeline; dragging the brush updates other charts to the selected year range. | Medium |
| D | **Chord diagram** | Replace the attacker–target bar chart with a chord diagram for a more expressive view of bilateral flows. | Medium–Hard |
| E | **Choropleth world map** | Add a new map section where countries are colored by incident count, with hover tooltips. | Medium–Hard |
| F | **Cross-chart filtering** | Clicking a bar or country filters all other visualizations via a shared event dispatcher. | Medium |
| G | **Map click detail panel** | Clicking a country on the map opens a side panel showing top initiators, incident type breakdown, and a mini timeline. | Medium |
| H | **Incident type toggle** | A toggle button on the bar chart section to switch between "Top targeted countries" and "Top incident types" views. | Low |
| I | **Dark mode** | A theme toggle in the nav bar switching between the current light palette and a dark palette. | Low |

---

## Functional Prototype

The current prototype is available in the `src/` directory and can be opened directly in a browser (`src/index.html`).

### What is already working

- **Full website skeleton**: sticky navigation bar, hero section with project introduction, four analytical sections each with explanatory text and chart containers, and a conclusion section.
- **Responsive design**: the layout adapts to desktop, tablet, and mobile screen widths using CSS Grid and media queries.
- **Editorial design system**: consistent use of cards, section tags, key-takeaway boxes, and a muted warm color palette inspired by *Our World in Data* and the *Financial Times Visual Vocabulary*.
- **Four chart sections** populated with static charts (PNG images generated with Python/Matplotlib in Milestone 1):
  1. Evolution of cyber incidents over time (line chart)
  2. Top 10 targeted countries (horizontal bar chart)
  3. Top 10 incident types (horizontal bar chart)
  4. Most frequent attacker–target relationships (horizontal bar chart)
- **Summary metrics row**: four metric cards displaying the analytical dimensions (Time, Geography, Incident Types, Actors).

### What will change for Milestone 3

The static PNG images will be **replaced by interactive visualizations**. The charts will support hover interactions, tooltips, and potentially cross-chart filtering. Enhancements from the list above will be added progressively, following the MVP-first, enhancements-second strategy.
