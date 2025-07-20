# 🌊 Coastal Climate Impact Analyzer 🌍  
**Predicting Shoreline Change and Assessing Coastal Risk Using GIS and AI**

## 📌 Project Overview

**Coastal Climate Impact Analyzer** is a full-stack web-based GIS application designed to identify, assess, and visualize the impacts of rising sea levels and unplanned urbanization on vulnerable coastal zones—specifically focusing on **Alexandria, Egypt**. The system integrates GIS spatial analysis, AI-based shoreline prediction models, and interactive dashboards to support sustainable coastal planning.

This project is a graduation capstone, combining historical spatial data, machine learning predictions, and geospatial visualization tools to deliver actionable insights for decision-makers, researchers, and urban planners.

---

## 🔍 Problem Statement

Rapid and **unplanned urban expansion** in low-lying coastal areas—especially in the Nile Delta—is putting infrastructure, ecosystems, and human lives at risk from **sea level rise (SLR)**. There is a pressing need for a predictive and spatially-aware system to:

- Highlight vulnerable areas  
- Forecast future shoreline positions  
- Assess infrastructure and population risk  
- Recommend mitigation strategies

---

## ✅ Key Features

### 🗺️ Geospatial Visualizations
- **Interactive Map of Coastal Vulnerability Index (CVI)** using ArcGIS layers
- **Time Series Forecasting Map** of shoreline change across the years 1986–2100
- Display of historical shorelines (1986, 2007, 2013, 2018, 2023) and projected ones (2030–2100)

### 🤖 AI-Driven Prediction
- Input parameters (e.g., LRR, NSM, SLR trend, elevation) to predict future shoreline positions using a trained machine learning model

### 🧮 Risk Analysis
- **Building & Infrastructure Risk Assessment** based on predicted shorelines  
- **SLR Scenario Impact Analysis** using elevation data  
- **Point Location Check** to determine if a site lies in a high-risk zone  

### 📊 Dashboard & Reporting
- Dashboard showing:
  - Number of at-risk buildings
  - Affected population estimates
  - Buffer zone statistics  
- Charts & indicators of coastal safety  
- Cost estimates for mitigation strategies  
- Exportable **PDF reports** summarizing analysis

### 🔁 Data Management
- Upload custom spatial datasets (e.g., buildings, shoreline, elevation)  
- Download analysis results and spatial datasets  
- Export full reports for documentation or presentation

### 🛠️ What-If Simulation
- Simulate shoreline predictions with **solution strategies** like:
  - Buffer zoning
  - Coastal defense infrastructure  
  - Managed retreat  
- Evaluate the effect of mitigation strategies on future shorelines

---

## 🧱 Tech Stack

| Layer        | Technology                      |
|--------------|----------------------------------|
| Frontend     | React, Leaflet, ArcGIS JS API   |
| Backend      | ASP.NET Core + Flask (for AI Model) |
| AI Model     | Trained Python model for shoreline forecasting |
| GIS Platform | ArcGIS Pro (for preprocessing and CVI calculation) |
| Data Format  | Feature Classes, GeoJSON, CSV   |
| Hosting      | GitHub + Render/Vercel (planned) |

---

## 📂 Project Structure

```
/client             → React Frontend
/server             → ASP.NET Backend
/model-api          → Flask API for AI model prediction
/data               → GIS datasets (shorelines, buildings, DEM, etc.)
/docs               → Methodology, reports, diagrams
```

---

## 🔄 ArcGIS Pro Add-In Integration
The project includes an ArcGIS Pro Add-In developed using the ArcGIS Pro SDK for .NET to allow planners and GIS analysts to trigger shoreline prediction directly inside the ArcGIS environment.

⚙️ How It Works
1- User Inputs Prediction Year:
A custom ArcGIS Pro UI element prompts the user to enter a target year (e.g., 2036).

2- Python AI Model Execution:
Upon clicking the prediction button, the add-in calls a Python script using a trained AI model via a separate Flask-free pipeline. The script:
	Runs the shoreline prediction model
	Converts the output to GeoDataFrame
	Reprojects to WGS84
	Saves the result as a Shapefile

3- Layer Loading in ArcGIS:
The resulting shapefile is automatically loaded into the current ArcGIS Pro map and zoomed to view. The tool also removes previous prediction layers to avoid duplication.

📁 Paths & Requirements
Ensure you have the following paths set correctly in your environment:
	Python path: your arcgis-clone Conda environment (used in addin.py)
	Script path: addin.py located inside react-app/backend
	Model input: a CSV such as Test.csv in the same directory
	Output: predicted shoreline shapefile in the output/ folder

❗ Make sure the ArcGIS Pro SDK references are properly set and the Python environment contains the required GIS libraries (geopandas, pyproj, etc.)

---

## 📈 Future Enhancements

- Add user authentication and role-based access  
- Real-time alerts for new risk zones  
- Mobile support for field inspection  
- Integration with live satellite data or APIs

---

## 🤝 Contributors

- GIS Analysts  
- GIS Developers  
- AI Engineers  
- Supervised by [Your Supervisor's Name]

---

## 🧠 Why This Matters

> With rising sea levels becoming an existential threat to coastal cities, **predictive and spatial technologies** offer a path toward **sustainable development**, **risk reduction**, and **urban resilience**. This tool empowers stakeholders with the information needed to **plan ahead**, **act now**, and **protect the future**.

---

## 📜 License

This project is for educational purposes. Licensing and data use should comply with the original dataset sources (e.g., Copernicus, IPCC, PSMSL, etc.).
