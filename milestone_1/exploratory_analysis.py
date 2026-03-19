import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# -------------------------
# Load cleaned dataset
# -------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

data_path = os.path.join(BASE_DIR, "..", "data", "cyber_incidents_ref.csv")

df = pd.read_csv(data_path)

# -------------------------
# Create figures folder
# -------------------------

figures_path = os.path.join(BASE_DIR, "figures")
os.makedirs(figures_path, exist_ok=True)

sns.set_theme(style="whitegrid")

# -------------------------
# Helper: values to exclude
# -------------------------

EXCLUDE_VALUES = {"not available", "unknown", "n/a", "none", "nan"}

def is_valid(val):
    """Return True if the value is not a placeholder/unknown."""
    return str(val).strip().lower() not in EXCLUDE_VALUES

# -------------------------
# Helper: normalize country names
# -------------------------

COUNTRY_NAME_MAP = {
    "Korea, Democratic People's Republic of": "North Korea",
    "Korea, Republic of": "South Korea",
    "Iran, Islamic Republic of": "Iran",
    "Syrian Arab Republic": "Syria",
    "Russian Federation": "Russia",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "Bolivia (Plurinational State of)": "Bolivia",
    "Venezuela (Bolivarian Republic of)": "Venezuela",
    "Tanzania, United Republic of": "Tanzania",
    "Viet Nam": "Vietnam",
    "Lao People's Democratic Republic": "Laos",
    "Congo, Democratic Republic of the": "DR Congo",
}

def normalize_country(val):
    return COUNTRY_NAME_MAP.get(str(val).strip(), str(val).strip())


# -------------------------
# 1. Most targeted countries
# -------------------------

plt.figure(figsize=(10, 6))

top_countries = (
    df[df["receiver_country"].apply(is_valid)]["receiver_country"]
    .value_counts()
    .head(10)
)

sns.barplot(
    x=top_countries.values,
    y=top_countries.index,
    palette="viridis"
)

plt.title("Top 10 Countries Targeted by Cyber Incidents", fontsize=16, weight="bold")
plt.xlabel("Number of Incidents")
plt.ylabel("Target Country")

plt.tight_layout()
plt.savefig(os.path.join(figures_path, "top_target_countries.png"))
plt.close()


# -------------------------
# 2. Attacker vs Target relationships
# -------------------------

df_pairs = df[
    df["initiator_country"].apply(is_valid) &
    df["receiver_country"].apply(is_valid)
].copy()

# Normalize long country names
df_pairs["initiator_country"] = df_pairs["initiator_country"].apply(normalize_country)
df_pairs["receiver_country"] = df_pairs["receiver_country"].apply(normalize_country)

# Remove within-country attacks
df_pairs = df_pairs[df_pairs["initiator_country"] != df_pairs["receiver_country"]]

pair_counts = (
    df_pairs.groupby(["initiator_country", "receiver_country"])
    .size()
    .reset_index(name="count")
)

top_pairs = pair_counts.sort_values("count", ascending=False).head(15)

plt.figure(figsize=(12, 7))

sns.barplot(
    data=top_pairs,
    x="count",
    y=top_pairs["initiator_country"] + " → " + top_pairs["receiver_country"],
    palette="magma"
)

plt.title("Most Frequent Cyber Incident Relationships", fontsize=16, weight="bold")
plt.xlabel("Number of Incidents")
plt.ylabel("Initiator → Target")

plt.tight_layout()
plt.savefig(os.path.join(figures_path, "top_attack_pairs.png"))
plt.close()

# -------------------------
# 3. Distribution of incident types 
# -------------------------

if "incident_type" in df.columns:
    df_types = df[df["incident_type"].apply(is_valid)].copy()

    incident_series = (
        df_types["incident_type"]
        .astype(str)
        .str.split(";")
        .explode()
        .str.strip()
    )

    incident_series = incident_series[
        incident_series.apply(is_valid)
    ]

    top_incident_types = (
        incident_series.value_counts().head(10)
    )

    plt.figure(figsize=(10, 6))

    sns.barplot(
        x=top_incident_types.values,
        y=top_incident_types.index,
        palette="crest"
    )

    plt.title("Top 10 Incident Types", fontsize=16, weight="bold")
    plt.xlabel("Number of Incidents")
    plt.ylabel("Incident Type")

    plt.tight_layout()
    plt.savefig(os.path.join(figures_path, "top_incident_types_split.png"))
    plt.close()

# -------------------------
# 4. Evolution of incidents over time
# -------------------------

if "start_date" in df.columns:
    df_time = df.copy()

    df_time["start_date"] = pd.to_datetime(df_time["start_date"], errors="coerce")

    df_time = df_time[df_time["start_date"].notna()].copy()
    df_time["year"] = df_time["start_date"].dt.year
    df_time = df_time[(df_time["year"] >= 2000) & (df_time["year"] <= 2025)]
    yearly_counts = (
        df_time["year"]
        .value_counts()
        .sort_index()
    )

    plt.figure(figsize=(11, 6))

    sns.lineplot(
        x=yearly_counts.index,
        y=yearly_counts.values,
        marker="o"
    )

    plt.title("Evolution of Cyber Incidents Over Time", fontsize=16, weight="bold")
    plt.xlabel("Year")
    plt.ylabel("Number of Incidents")

    plt.tight_layout()
    plt.savefig(os.path.join(figures_path, "incidents_over_time.png"))
    plt.close()
