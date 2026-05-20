# Global Cyber Incident Patterns

**COM-480 Data Visualization · EPFL 2025**

An interactive, narrative-driven visualization of global cybersecurity incidents built on the [EuRepoC dataset](https://eurepoc.eu/table-view/). The site transforms 4,374 documented cyber operations across 211 countries (2000–2025) into five coordinated, filterable views that surface the most interpretable structures in the data.

**[Live demo](https://com-480-data-visualization.github.io/visec/src/)**

---

## Team

| Name | SCIPER |
|---|---|
| Ziyad BAGHOURI | 342896 |
| Rayane BENTAHAR | 361420 |
| Ayman BAKIRI | 327169 |
| Mohamed Sami GHRAB | 315264 |

---

## What the visualization shows

The site is structured as a scrollytelling narrative with five analytical sections, each pairing a short explanatory text with an interactive chart.

| Section | Question answered | Chart type |
|---|---|---|
| 1 · Evolution | How have cyber incidents evolved over time? | Line + area chart with brush selector |
| 2 · Targets | Which countries are targeted most often? | Horizontal bar chart |
| 3 · Incident types | What types of incidents dominate? | Horizontal bar chart |
| 4 · Relationships | Which attacker–target pairs recur? | Horizontal bar chart (global or per-country split) |
| 5 · World map | Where do attacks flow geographically? | Choropleth map with arc arrows |

---

## Interactions

**Time filter** — drag the brush in the mini chart below the timeline (Section 1) to select any year range from 2000 to 2025. All other charts update instantly.

**Country filter** — click any bar in the Targets chart, or type in the search box below it, to focus the entire site on one country. The Incident types chart narrows to incidents involving that country; the Relationships chart splits into two panels showing who attacks it and who it attacks.

**Filter chips** — each chart header shows a compact chip summarising the active filters when filters are applied. Click the chip to open a dropdown listing each active filter individually, with a remove button for each.

**Global filter bar** — a persistent bar below the hero always shows the current time window and selected country. The Reset all filters button clears everything at once.

**World map hover** — hovering any country highlights it, draws two arc arrows (red incoming from its top attacker, orange outgoing to its top target), and shows a tooltip with incident counts.

**Scroll animations** — Sections 2, 3, and 4 animate into view the first time they enter the viewport. Filter interactions always override this and re-render immediately.

---

## Technical setup

The project is a self-contained static site with no build step. All dependencies are loaded from CDN.

**Dependencies**

| Library | Version | Purpose |
|---|---|---|
| [D3.js](https://d3js.org/) | v7 | All charts, scales, axes, brush, geo |
| [TopoJSON client](https://github.com/topojson/topojson-client) | v3 | Decoding world geometry |
| [world-atlas](https://github.com/topojson/world-atlas) | v2 | 110m country geometry (loaded at runtime) |

**Running locally**

```bash
cd src
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser. The site fetches `../data/cyber_incidents_ref.csv` relative to `src/`, so the server must be started from inside `src/`.

> Any static file server works (`npx serve`, `live-server`, VS Code Live Server extension, etc.).

---

## Repository structure

```
visec/
├── src/
│   ├── index.html        # Page structure and section markup
│   ├── script.js         # All D3 logic, data processing, and interactions
│   └── style.css         # Design system, layout, and chart styles
├── data/
│   ├── cyber_incidents_ref.csv   # Cleaned dataset (13 columns, used by the site)
│   ├── eurepoc_data.csv          # Original EuRepoC export (84 columns)
│   └── code/
│       └── refactor_data.py      # Script used to produce the cleaned CSV
├── milestone_1/                  # Exploratory analysis and M1 report
├── milestone_2/                  # Design sketches and M2 report
└── README.md
```

---

## Dataset

**EuRepoC Global Dataset of Cyber Incidents** — a curated database of real-world cyber operations compiled by the European Repository of Cyber Incidents project. The original export contains 84 columns per incident; we reduced it to 13 for this visualization:

`start_date` · `incident_type` · `receiver_country` · `receiver_region` · `receiver_category` · `initiator_country` · `initiator_category` · `data_theft` · `has_disruption` · `disruption` · `hijacking` · `economic_impact` · `impact_indicator_value`

Several fields (`receiver_country`, `initiator_country`, `incident_type`) are semicolon-separated and can list multiple values per incident. The cleaning script is at `data/code/refactor_data.py`.

Source: [https://eurepoc.eu/table-view/](https://eurepoc.eu/table-view/)
