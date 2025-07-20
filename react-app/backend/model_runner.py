import pickle
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, LineString
import os
from pyproj import Transformer

# === Settings ===
feature_columns = ['LRR', 'Sea_Level_Rise_Trend_mm_year', 'NSM',
                   'Current_Position_X', 'Current_Position_Y',
                   'Elevation', 'Coastal_Slope']

trained_years = [2030, 2035, 2040, 2045, 2050, 2100]

models = {}
for year in trained_years:
    with open(f"models_year/coastline_model_{year}_X.pkl", "rb") as fx:
        models[f"{year}_X"] = pickle.load(fx)
    with open(f"models_year/coastline_model_{year}_Y.pkl", "rb") as fy:
        models[f"{year}_Y"] = pickle.load(fy)


def predict_year_to_geojson(input_csv, year, output_dir):
    data = pd.read_csv(input_csv)
    features = data[feature_columns].copy().ffill()

    # Predict
    if year in trained_years:
        pred_x = models[f"{year}_X"].predict(features)
        pred_y = models[f"{year}_Y"].predict(features)
    else:
        lower = max([y for y in trained_years if y < year])
        upper = min([y for y in trained_years if y > year])
        w1 = (upper - year) / (upper - lower)
        w2 = (year - lower) / (upper - lower)
        pred_x = models[f"{lower}_X"].predict(
            features) * w1 + models[f"{upper}_X"].predict(features) * w2
        pred_y = models[f"{lower}_Y"].predict(
            features) * w1 + models[f"{upper}_Y"].predict(features) * w2

    # Add predicted geometry as points
    gdf = gpd.GeoDataFrame(
        data,
        geometry=[Point(x, y) for x, y in zip(pred_x, pred_y)],
        crs="EPSG:32635"
    )

    # Sort and create line
    if "OBJECTID" in gdf.columns:
        gdf = gdf.sort_values(by="OBJECTID")
    else:
        gdf = gdf.reset_index(drop=True)

    line = LineString(gdf.geometry.tolist())
    line_gdf = gpd.GeoDataFrame(geometry=[line], crs=gdf.crs)
    smoothed = line_gdf.simplify(tolerance=100, preserve_topology=False)

    # Convert to WGS84
    smoothed_wgs84 = smoothed.to_crs("EPSG:4326")


    # === Save both point and line outputs ===
    os.makedirs(os.path.dirname(output_dir), exist_ok=True)
    output_converted=f"output/predicted_shoreline_{year}_line_converted.geojson"
    output_point = f"output/predicted_shoreline_{year}_points.geojson"

    smoothed_wgs84.to_file(output_converted, driver="GeoJSON")
    gdf.to_file(output_point, driver="GeoJSON")
    smoothed.to_file(output_dir, driver="GeoJSON")

    return output_dir  # Return the line file path for frontend usage