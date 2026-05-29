# Global Cyber Incident Patterns

**COM-480 Data Visualization · EPFL 2026**

An interactive, narrative-driven visualization of global cybersecurity incidents built on the [EuRepoC dataset](https://eurepoc.eu/table-view/). The site transforms 4,374 documented cyber operations across 211 countries (2000–2025) into five coordinated, filterable views.

---

## Team

| Name | SCIPER |
|---|---|
| Ziyad BAGHOURI | 342896 |
| Rayane BENTAHAR | 361420 |
| Ayman BAKIRI | 327169 |
| Mohamed Sami GHRAB | 315264 |

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
├── milestone_3/                  # Process book 
└── README.md
```

---

## Technical setup

The project is a self-contained static site with no build step. All dependencies are loaded from CDN.

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

Then open `http://localhost:8080`. The server must be started from inside `src/` so the data file resolves correctly.

---

## Milestone 3

- The process book can be found [here](milestone_3/Visec_Process_Book.pdf)
- The final website is live [here](https://com-480-data-visualization.github.io/visec/src/)
- The screencast is available [here](https://youtu.be/ar9VwpvmHVo)

[![Screencast](https://img.youtube.com/vi/ar9VwpvmHVo/maxresdefault.jpg)](https://youtu.be/ar9VwpvmHVo)
