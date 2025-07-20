from flask import Flask, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
from model_runner import predict_year_to_geojson
from model import predict_year_point_to_geojson
import pandas as pd
import json
import os
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'geojson', 'json'}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    year = int(data["year"])  # e.g. 2043

    geojson_path = f"output/predicted_shoreline_{year}_line.geojson"
    csv_path = "Test.csv"  # You can customize this later

    try:
        predict_year_to_geojson(csv_path, year, geojson_path)
        return send_file(geojson_path, mimetype='application/json')
    except Exception as e:
        return {"error": str(e)}, 500
    

@app.route("/predict_point", methods=["POST"])
def predict_point():
    # Get JSON data instead of form data
    data = request.json
    
    required_fields = ['LRR', 'Sea_Level_Rise_Trend_mm_year', 'NSM',
                'Current_Position_X', 'Current_Position_Y',
                'Elevation', 'Coastal_Slope', 'year']

    # Validate all required fields are present
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            return {"error": f"Missing or empty required field: {field}"}, 400

    try:
        # Extract year and convert to int
        year = int(data["year"])
        
        # Prepare input data (exclude year for the model)
        input_data = {}
        for field in required_fields:
            if field != "year":  # Don't include year in model input
                input_data[field] = float(data[field])

        # Create DataFrame
        df = pd.DataFrame([input_data])

        # Create temporary CSV file
        os.makedirs("temp_inputs", exist_ok=True)
        csv_path = os.path.join("temp_inputs", f"point_input_{uuid.uuid4().hex}.csv")
        df.to_csv(csv_path, index=False)

        # Generate output path
        geojson_path = f"output/predicted_shoreline_{year}_point.geojson"

        # Make prediction
        predict_year_point_to_geojson(csv_path, year, geojson_path)
        
        # Clean up temporary file
        try:
            os.remove(csv_path)
        except:
            pass  # Ignore cleanup errors
            
        return send_file(geojson_path, mimetype='application/json')
        
    except ValueError as ve:
        return {"error": f"Invalid data format: {str(ve)}"}, 400
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}, 500
    

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_csv_file(file_path):
    """Process CSV file and return GeoJSON-like structure"""
    try:
        df = pd.read_csv(file_path)
        
        # Check if CSV has coordinate columns
        coord_columns = []
        for col in df.columns:
            col_lower = col.lower()
            if any(coord in col_lower for coord in ['lat', 'lon', 'x', 'y', 'longitude', 'latitude']):
                coord_columns.append(col)
        
        if len(coord_columns) >= 2:
            # Assume it's spatial data
            features = []
            for idx, row in df.iterrows():
                # Try to find coordinate columns
                x_col = None
                y_col = None
                
                for col in coord_columns:
                    col_lower = col.lower()
                    if 'lon' in col_lower or 'x' in col_lower:
                        x_col = col
                    elif 'lat' in col_lower or 'y' in col_lower:
                        y_col = col
                
                if x_col and y_col:
                    try:
                        x = float(row[x_col])
                        y = float(row[y_col])
                        
                        # Create properties from other columns
                        properties = {}
                        for col in df.columns:
                            if col not in [x_col, y_col]:
                                properties[col] = row[col]
                        
                        features.append({
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [x, y]
                            },
                            'properties': properties
                        })
                    except (ValueError, TypeError):
                        continue
            
            return {
                'type': 'FeatureCollection',
                'features': features
            }
        else:
            # Return raw data for non-spatial CSV
            return df.to_dict('records')
            
    except Exception as e:
        raise Exception(f"Error processing CSV: {str(e)}")

def process_geojson_file(file_path):
    """Process GeoJSON file and return validated structure"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate GeoJSON structure
        if not isinstance(data, dict):
            raise ValueError("Invalid GeoJSON format")
        
        if data.get('type') != 'FeatureCollection':
            raise ValueError("GeoJSON must be a FeatureCollection")
        
        if 'features' not in data:
            raise ValueError("GeoJSON must contain features")
        
        return data
        
    except json.JSONDecodeError:
        raise Exception("Invalid JSON format")
    except Exception as e:
        raise Exception(f"Error processing GeoJSON: {str(e)}")

@app.route("/upload_layer", methods=["POST"])
def upload_layer():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return {"error": "No file uploaded"}, 400
        
        file = request.files['file']
        file_type = request.form.get('fileType', '')
        
        if file.filename == '':
            return {"error": "No file selected"}, 400
        
        if not allowed_file(file.filename):
            return {"error": "Invalid file type. Only CSV and GeoJSON files are allowed."}, 400
        
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Create unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save the file
        file.save(file_path)
        
        # Process the file based on type
        try:
            if file_type == 'csv' or filename.lower().endswith('.csv'):
                processed_data = process_csv_file(file_path)
                layer_info = {
                    'geometryType': 'point',  # Most CSV files contain points
                    'dataType': 'csv',
                    'recordCount': len(processed_data.get('features', [])) if isinstance(processed_data, dict) else len(processed_data)
                }
            else:  # GeoJSON
                processed_data = process_geojson_file(file_path)
                
                # Determine geometry type from first feature
                geometry_type = 'unknown'
                if processed_data.get('features'):
                    first_feature = processed_data['features'][0]
                    if first_feature.get('geometry'):
                        geometry_type = first_feature['geometry'].get('type', 'unknown').lower()
                
                layer_info = {
                    'geometryType': geometry_type,
                    'dataType': 'geojson',
                    'recordCount': len(processed_data.get('features', []))
                }
            
            return {
                "message": "File uploaded successfully",
                "filePath": file_path,
                "fileName": filename,
                "data": processed_data,
                "layerInfo": layer_info
            }
            
        except Exception as processing_error:
            # Clean up the uploaded file if processing fails
            try:
                os.remove(file_path)
            except:
                pass
            return {"error": f"Error processing file: {str(processing_error)}"}, 400
        
    except Exception as e:
        return {"error": f"Upload failed: {str(e)}"}, 500

if __name__ == "__main__":
    app.run(debug=True)