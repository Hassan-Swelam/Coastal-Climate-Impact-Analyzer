import os
os.environ['PROJ_LIB'] = r'D:\Program Files\Python\conda_envs\arcgis-clone\Library\share\proj'

import sys
import geopandas as gpd
from model_runner import predict_year_to_geojson

if __name__ == "__main__":
    # Step 1: Get year and define paths
    year = int(sys.argv[1])
    input_csv = "Test.csv"

    # Save as a shapefile instead of GeoJSON
    shapefile_name = f"predicted_shoreline_{year}_line.shp"
    output_folder = os.path.abspath("output")
    output_path = os.path.join(output_folder, shapefile_name)

    # Step 2: Generate prediction as GeoDataFrame (temporarily use GeoJSON)
    temp_geojson_path = os.path.join(output_folder, f"temp_{year}.geojson")
    predict_year_to_geojson(input_csv, year, temp_geojson_path)

    # Step 3: Read & reproject to WGS84
    try:
        gdf = gpd.read_file(temp_geojson_path)
        gdf.set_crs(epsg=32635, inplace=True, allow_override=True)  # UTM Zone 35N
        gdf = gdf.to_crs(epsg=4326)  # Reproject to WGS84

        # Step 4: Save as Shapefile
        gdf.to_file(output_path, driver="ESRI Shapefile")

        # Optional: delete temporary GeoJSON
        os.remove(temp_geojson_path)

    except Exception as e:
        print(f"Error during reprojection or shapefile export: {e}", file=sys.stderr)
        sys.exit(1)

    # Step 5: Print final path
    print(output_path)
