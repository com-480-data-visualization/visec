import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SKETCHES_DIR = os.path.join(BASE_DIR, "sketches")
os.makedirs(SKETCHES_DIR, exist_ok=True)

SKETCH_COLOR = "#3a3a3a"
LIGHT_GRAY = "#d0d0d0"
MID_GRAY = "#999999"
ACCENT = "#0f5c94"
BG = "#fafafa"

# World map choropleth
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor(BG)
ax.set_facecolor("#eef2f6")

# Continent outlines
na = plt.Polygon([(-160,70),(-60,70),(-60,25),(-100,15),(-120,30),(-160,60)],
                 closed=True, fill=True, fc=LIGHT_GRAY, ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(na)

sa = plt.Polygon([(-80,12),(-35,5),(-35,-55),(-70,-55),(-80,-10)],
                 closed=True, fill=True, fc=LIGHT_GRAY, ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(sa)

eu = plt.Polygon([(-10,72),(40,72),(45,40),(30,35),(-10,36)],
                 closed=True, fill=True, fc="#a8c8e8", ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(eu)

af = plt.Polygon([(-18,35),(50,35),(50,-35),(10,-35),(-18,0)],
                 closed=True, fill=True, fc=LIGHT_GRAY, ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(af)

asia = plt.Polygon([(45,72),(150,72),(150,10),(100,5),(60,25),(45,40)],
                   closed=True, fill=True, fc="#7db5d6", ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(asia)

aus = plt.Polygon([(110,-10),(155,-10),(155,-42),(115,-42)],
                  closed=True, fill=True, fc=LIGHT_GRAY, ec=SKETCH_COLOR, lw=1.2)
ax.add_patch(aus)

highlights = [(-100, 40, "US"), (10, 50, "DE"), (37, 50, "UA"),
              (105, 35, "CN"), (55, 28, "IR"), (35, 32, "IL")]
for x, y, label in highlights:
    ax.plot(x, y, 'o', color=ACCENT, markersize=10, alpha=0.7)
    ax.annotate(label, (x, y), fontsize=7, ha='center', va='bottom',
                xytext=(0, 8), textcoords='offset points', color=SKETCH_COLOR, weight='bold')

legend_box = FancyBboxPatch((105, 55), 48, 18, boxstyle="round,pad=2",
                             fc="white", ec=SKETCH_COLOR, lw=1)
ax.add_patch(legend_box)
ax.text(129, 70, "Incidents received", ha='center', fontsize=8, color=SKETCH_COLOR, weight='bold')
ax.text(129, 64, "Low", ha='center', fontsize=7, color=MID_GRAY)
ax.text(129, 59, "High", ha='center', fontsize=7, color=ACCENT)

tooltip_box = FancyBboxPatch((-55, 42), 52, 18, boxstyle="round,pad=2",
                              fc="white", ec=ACCENT, lw=1.5)
ax.add_patch(tooltip_box)
ax.text(-29, 56, "United States", ha='center', fontsize=8, weight='bold', color=SKETCH_COLOR)
ax.text(-29, 50, "Incidents: 847  |  Top type: Espionage", ha='center', fontsize=6.5, color=MID_GRAY)
ax.annotate("", xy=(-100, 40), xytext=(-55, 46),
            arrowprops=dict(arrowstyle='->', color=ACCENT, lw=1.2))

ax.set_xlim(-180, 180)
ax.set_ylim(-60, 80)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title("Sketch: Interactive Choropleth World Map", fontsize=13, weight='bold',
             color=SKETCH_COLOR, pad=12)

fig.tight_layout()
fig.savefig(os.path.join(SKETCHES_DIR, "sketch_world_map.png"), dpi=150, bbox_inches='tight')
plt.close()


# Timeline with brush
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6), height_ratios=[3, 1],
                                gridspec_kw={'hspace': 0.35})
fig.patch.set_facecolor(BG)

years = np.arange(2000, 2026)
counts = np.array([12, 18, 20, 25, 30, 28, 35, 40, 45, 50,
                   65, 80, 90, 110, 130, 160, 200, 250, 310, 380,
                   450, 520, 580, 650, 720, 780])

ax1.set_facecolor("white")
ax1.fill_between(years, counts, alpha=0.15, color=ACCENT)
ax1.plot(years, counts, color=ACCENT, lw=2.5, marker='o', markersize=4)
ax1.set_ylabel("Incidents", fontsize=10, color=SKETCH_COLOR)
ax1.set_title("Sketch: Interactive Timeline with Brush Selection", fontsize=13,
              weight='bold', color=SKETCH_COLOR, pad=12)
ax1.spines[['top', 'right']].set_visible(False)
ax1.tick_params(colors=SKETCH_COLOR)

ax1.annotate("2022: 650 incidents\nTop type: Hijacking with Misuse",
             xy=(2022, 650), xytext=(2015, 700),
             fontsize=8, color=SKETCH_COLOR,
             bbox=dict(boxstyle='round,pad=0.4', fc='white', ec=ACCENT, lw=1.2),
             arrowprops=dict(arrowstyle='->', color=ACCENT))

ax1.axvspan(2018, 2024, alpha=0.08, color=ACCENT)

ax2.set_facecolor("#f5f5f5")
ax2.fill_between(years, counts, alpha=0.2, color=MID_GRAY)
ax2.plot(years, counts, color=MID_GRAY, lw=1.5)
ax2.axvspan(2018, 2024, alpha=0.2, color=ACCENT)

for bx in [2018, 2024]:
    ax2.axvline(bx, color=ACCENT, lw=2)
    ax2.plot(bx, counts[bx - 2000] * 0.5, 's', color=ACCENT, markersize=8)

ax2.set_xlabel("Year", fontsize=10, color=SKETCH_COLOR)
ax2.set_ylabel("Overview", fontsize=9, color=MID_GRAY)
ax2.spines[['top', 'right']].set_visible(False)
ax2.tick_params(colors=SKETCH_COLOR)

ax2.text(2021, max(counts) * 0.85, "drag to select range",
         ha='center', fontsize=8, style='italic', color=ACCENT)

fig.tight_layout()
fig.savefig(os.path.join(SKETCHES_DIR, "sketch_timeline_brush.png"), dpi=150, bbox_inches='tight')
plt.close()


# Chord diagram (attacker -> target)
fig, ax = plt.subplots(figsize=(8, 8))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)

countries = ["US", "CN", "RU", "UA", "DE", "IR", "IL", "NK", "KR", "UK"]
n = len(countries)
angles = np.linspace(0, 2 * np.pi, n, endpoint=False)

for i, (a, c) in enumerate(zip(angles, countries)):
    x, y = 4.2 * np.cos(a), 4.2 * np.sin(a)
    arc_start = np.degrees(a) - 15
    arc_end = np.degrees(a) + 15
    arc = mpatches.Arc((0, 0), 8.8, 8.8, angle=0,
                        theta1=arc_start, theta2=arc_end,
                        color=ACCENT, lw=6, alpha=0.6)
    ax.add_patch(arc)
    lx, ly = 5.0 * np.cos(a), 5.0 * np.sin(a)
    ax.text(lx, ly, c, ha='center', va='center', fontsize=10,
            weight='bold', color=SKETCH_COLOR)

chords = [(1, 0, 0.8), (2, 0, 0.7), (2, 3, 0.65), (5, 6, 0.5),
          (7, 8, 0.45), (1, 4, 0.35), (2, 4, 0.3)]

for src, tgt, width in chords:
    x1, y1 = 3.8 * np.cos(angles[src]), 3.8 * np.sin(angles[src])
    x2, y2 = 3.8 * np.cos(angles[tgt]), 3.8 * np.sin(angles[tgt])
    alpha = 0.15 + width * 0.4
    lw = 1 + width * 6
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=ACCENT,
                                lw=lw, alpha=alpha,
                                connectionstyle="arc3,rad=0.3"))

tooltip_box = FancyBboxPatch((0.5, -1.5), 3.8, 1.2, boxstyle="round,pad=0.3",
                              fc="white", ec=ACCENT, lw=1.2)
ax.add_patch(tooltip_box)
ax.text(2.4, -0.65, "CN -> US : 312 incidents", ha='center', fontsize=8,
        weight='bold', color=SKETCH_COLOR)
ax.text(2.4, -1.15, "click chord for details", ha='center', fontsize=7,
        style='italic', color=MID_GRAY)

ax.set_xlim(-6, 6)
ax.set_ylim(-6, 6)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title("Sketch: Chord Diagram — Attacker-Target Flows", fontsize=13,
             weight='bold', color=SKETCH_COLOR, pad=12)

fig.tight_layout()
fig.savefig(os.path.join(SKETCHES_DIR, "sketch_chord_diagram.png"), dpi=150, bbox_inches='tight')
plt.close()


# Website layout wireframe
fig, ax = plt.subplots(figsize=(10, 14))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)

def draw_box(ax, x, y, w, h, label="", sublabel="", fill="#ffffff", border=LIGHT_GRAY):
    rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                           fc=fill, ec=border, lw=1.2)
    ax.add_patch(rect)
    if label:
        ax.text(x + w/2, y + h/2 + (0.15 if sublabel else 0), label,
                ha='center', va='center', fontsize=9, weight='bold', color=SKETCH_COLOR)
    if sublabel:
        ax.text(x + w/2, y + h/2 - 0.25, sublabel,
                ha='center', va='center', fontsize=7, color=MID_GRAY)

draw_box(ax, 0, 13, 10, 0.7, "Navigation Bar — Global Cyber Incident Patterns",
         fill="#f0ede7", border=SKETCH_COLOR)

draw_box(ax, 0, 11.5, 10, 1.3, "Hero Section",
         "Understanding global cyber incident patterns", fill="white")

for i, label in enumerate(["Time", "Geography", "Incident Types", "Actors"]):
    draw_box(ax, i * 2.5, 10.7, 2.3, 0.6, label, fill="#f0ede7")

draw_box(ax, 0, 8.5, 10, 2, fill="white")
draw_box(ax, 0.3, 9.5, 3.5, 0.8, "Text: Evolution\nover time", fill="#f7f7f7")
draw_box(ax, 4.2, 8.7, 5.5, 1.6, "D3.js Interactive Timeline\n+ Brush selector",
         fill="#eef2f6", border=ACCENT)
ax.text(5, 10.3, "SECTION 1", fontsize=7, color=ACCENT, weight='bold')

draw_box(ax, 0, 6, 10, 2.2, fill="white")
draw_box(ax, 0.3, 6.2, 3.5, 1.8, "Text: Which countries\nare targeted?\n\n+ Country details\npanel (left sidebar)",
         fill="#f7f7f7")
draw_box(ax, 4.2, 6.2, 5.5, 1.8, "D3.js Choropleth Map\n\nHover for tooltips\nClick for country details",
         fill="#eef2f6", border=ACCENT)
ax.text(5, 8.0, "SECTION 2", fontsize=7, color=ACCENT, weight='bold')

draw_box(ax, 0, 3.8, 10, 1.8, fill="white")
draw_box(ax, 0.3, 4.0, 3.5, 1.4, "Text: Most common\nincident types",
         fill="#f7f7f7")
draw_box(ax, 4.2, 4.0, 5.5, 1.4, "D3.js Interactive Bar Chart\n\nHover highlights\nLinked to timeline filter",
         fill="#eef2f6", border=ACCENT)
ax.text(5, 5.4, "SECTION 3", fontsize=7, color=ACCENT, weight='bold')

draw_box(ax, 0, 1.5, 10, 2, fill="white")
draw_box(ax, 0.3, 1.7, 3.5, 1.6, "Text: Attacker-target\nrelationships\n\n+ Pair detail panel",
         fill="#f7f7f7")
draw_box(ax, 4.2, 1.7, 5.5, 1.6, "D3.js Chord Diagram\n\nClick chord to highlight\npath & show details",
         fill="#eef2f6", border=ACCENT)
ax.text(5, 3.3, "SECTION 4", fontsize=7, color=ACCENT, weight='bold')

draw_box(ax, 0, 0.3, 10, 0.9, "Conclusion — What these visualizations reveal",
         fill="#f0ede7")

ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-0.3, 14.2)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title("Sketch: Website Layout — Final Product Wireframe", fontsize=14,
             weight='bold', color=SKETCH_COLOR, pad=14)

fig.tight_layout()
fig.savefig(os.path.join(SKETCHES_DIR, "sketch_website_layout.png"), dpi=150, bbox_inches='tight')
plt.close()


# Bar chart with tooltips
fig, ax = plt.subplots(figsize=(10, 6))
fig.patch.set_facecolor(BG)
ax.set_facecolor("white")

countries = ["United States", "Germany", "Ukraine", "United Kingdom",
             "India", "Israel", "France", "South Korea", "Australia", "China"]
values = [847, 310, 280, 220, 195, 180, 170, 155, 140, 130]

colors = [ACCENT if i != 0 else "#0a4670" for i in range(len(countries))]
alphas = [0.5 if i != 0 else 1.0 for i in range(len(countries))]

bars = ax.barh(countries[::-1], values[::-1], color=colors[::-1], edgecolor='none', height=0.65)
for bar, a in zip(bars, alphas[::-1]):
    bar.set_alpha(a)

bars[-1].set_alpha(1.0)
bars[-1].set_edgecolor(ACCENT)
bars[-1].set_linewidth(2)

tooltip_box = FancyBboxPatch((600, 8.5), 220, 1.2, boxstyle="round,pad=0.2",
                              fc="white", ec=ACCENT, lw=1.5, transform=ax.transData)
ax.add_patch(tooltip_box)
ax.text(710, 9.3, "United States", fontsize=9, weight='bold', ha='center',
        color=SKETCH_COLOR, transform=ax.transData)
ax.text(710, 8.85, "847 incidents | Top: Espionage", fontsize=7.5, ha='center',
        color=MID_GRAY, transform=ax.transData)

ax.spines[['top', 'right']].set_visible(False)
ax.set_xlabel("Number of Incidents", fontsize=10, color=SKETCH_COLOR)
ax.tick_params(colors=SKETCH_COLOR)
ax.set_title("Sketch: Interactive Bar Chart — Top Targeted Countries", fontsize=13,
             weight='bold', color=SKETCH_COLOR, pad=12)

ax.text(850, -0.5, "hover to highlight bar\nclick to filter other charts",
        fontsize=8, style='italic', color=ACCENT, ha='right')

fig.tight_layout()
fig.savefig(os.path.join(SKETCHES_DIR, "sketch_bar_chart.png"), dpi=150, bbox_inches='tight')
plt.close()

print("All sketches saved to:", SKETCHES_DIR)
