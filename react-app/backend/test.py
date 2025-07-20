import pickle
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import os
from shapely.geometry import LineString


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

def predict_year_to_geojson(input_csv, year, output_path):
    data = pd.read_csv(input_csv)
    features = data[feature_columns].copy().ffill()

    # Predict
    if year in trained_years:
        pred_x = models[f"{year}_X"].predict(features)
        pred_y = models[f"{year}_Y"].predict(features)
    else:
        # Interpolate
        lower = max([y for y in trained_years if y < year])
        upper = min([y for y in trained_years if y > year])
        w1 = (upper - year) / (upper - lower)
        w2 = (year - lower) / (upper - lower)
        pred_x = models[f"{lower}_X"].predict(features) * w1 + models[f"{upper}_X"].predict(features) * w2
        pred_y = models[f"{lower}_Y"].predict(features) * w1 + models[f"{upper}_Y"].predict(features) * w2

    # Convert to GeoJSON
    gdf = gpd.GeoDataFrame(
        data,
        geometry=[Point(xy) for xy in zip(pred_x, pred_y)],
        crs="EPSG:4326"
    )
    ########### new
    gdf = gdf.sort_values(by="OBJECTID")
    line = LineString(gdf.geometry.tolist())

    line_gdf = gpd.GeoDataFrame(geometry=[line], crs=gdf.crs)
    line_gdf.to_file("output/predicted_shoreline_2043_line.geojson", driver="GeoJSON")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    gdf.to_file(output_path, driver='GeoJSON')
    return output_path

