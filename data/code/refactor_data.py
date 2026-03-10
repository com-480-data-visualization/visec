import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

raw_data_path = os.path.join(BASE_DIR, "..", "eurepoc_data.csv")
ref_data_path = os.path.join(BASE_DIR, "..", "cyber_incidents_ref.csv")


# Load dataset
df = pd.read_csv(raw_data_path)

print("Original dataset shape:", df.shape)

# Columns to keep
columns_to_keep = [
    "start_date",
    "incident_type",
    "receiver_country",
    "receiver_region",
    "receiver_category",
    "initiator_country",
    "initiator_category",
    "data_theft",
    "has_disruption",
    "disruption",
    "hijacking",
    "economic_impact",
    "impact_indicator_value"
]

df_clean = df[columns_to_keep]


# Save dataset
df_clean.to_csv(ref_data_path, index=False)

