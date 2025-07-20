import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useEffect, useState } from 'react';
import { useTypewriter } from "react-simple-typewriter";
import { loadModules } from 'esri-loader';
import FileUploadComponent from './FileUploadComponent';
import DownloadSingleLayer from './DownloadSingleLayer';
import LayerDownloadComponent, { LayerDownloadButton } from './LayerDownloadComponent';
import './FileUpload.css';
import './MapComponents.css';
import axios from 'axios';
import './LayerDownload.css';
import { useNavigate } from "react-router-dom";
import { usePredictionYear } from "../PredictionYearContext";
import { usePredictedShoreline } from '../PredictedShorelineContext';

function Prediction({ setReportData }) {
  // Add these new state variables after your existing states
  const [persistentLayers, setPersistentLayers] = useState([]);
  const [isLoadingPersistentLayers, setIsLoadingPersistentLayers] = useState(false);

  const [uploadedLayers, setUploadedLayers] = useState([]);

  const navigate = useNavigate();
  const [isPredicted, setIsPredicted] = useState(false);
  const { setPredictedYear } = usePredictionYear();
  const { setPredictedShoreline } = usePredictedShoreline();

  // Change: initialize as empty string for controlled input
  const [yearToPredict, setYearToPredict] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [layers, setLayers] = useState([]);
  const [isClickMode, setIsClickMode] = useState(false); // New state for click mode

  const [isRiskMode, setIsRiskMode] = useState(false); //for risk checker

  const colors = [
    "red", "yellow", "orange", "black", "green", "violet",
    "blue", "brown", "cyan", "magenta", "lime", "pink",
    "teal", "gold", "coral", "indigo", "salmon", "turquoise",
    "navy", "maroon", "olive", "chocolate", "crimson", "orchid",
    "darkgreen", "darkblue", "darkred", "lightblue", "lightgreen",
    "lightcoral", "plum", "khaki", "lavender", "peru", "slateblue",
    "tomato", "sienna", "royalblue", "steelblue", "mediumseagreen",
    "darkorange", "mediumvioletred", "dodgerblue", "firebrick", "forestgreen",
    "hotpink", "midnightblue", "seagreen", "skyblue", "springgreen", "thistle"
  ];

  const [typeEffect] = useTypewriter({
    words: ['Advanced Coastal Erosion Prediction System',
      'Analyze and forecast shoreline changes with precision',
      'Powered by machine learning and satellite imagery '],
    loop: {},
    typeSpeed: 100,
    deleteSpeed: 40,
    delaySpeed: 50
  })

  const [pointData, setPointData] = useState({
    LRR: "",
    Sea_Level_Rise_Trend_mm_year: "",
    NSM: "",
    Elevation: "",
    Current_Position_X: "",
    Current_Position_Y: "",
    Coastal_Slope: ""
  });

  // Separate year state for point prediction
  const [pointYearToPredict, setPointYearToPredict] = useState("");

  // Use useRef to persist map and view instances across renders
  const mapDiv = useRef(null);
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const shorelineLayerRef = useRef(null);
  const clickHandlerRef = useRef(null); // Store click handler reference
  const clickGraphicsLayerRef = useRef(null);

  // Helper functions for localStorage (add these right after your state declarations)
  const saveLayerToStorage = (layerData) => {
    try {
      const existingLayers = JSON.parse(localStorage.getItem('persistentLayers') || '[]');      const updatedLayers = [...existingLayers, layerData];
      localStorage.setItem('persistentLayers', JSON.stringify(updatedLayers));
      console.log('Layer saved to storage:', layerData.name);
    } catch (error) {
      console.error('Error saving layer to storage:', error);
    }
  };

  const loadLayersFromStorage = () => {
    try {
      const savedLayers = localStorage.getItem('persistentLayers');
      return savedLayers ? JSON.parse(savedLayers) : [];
    } catch (error) {
      console.error('Error loading layers from storage:', error);
      return [];
    }
  };

  const removeLayerFromStorage = (layerId) => {
    try {
      const existingLayers = JSON.parse(localStorage.getItem('persistentLayers') || '[]');      const updatedLayers = existingLayers.filter(layer => layer.id !== layerId);
      localStorage.setItem('persistentLayers', JSON.stringify(updatedLayers));
      console.log('Layer removed from storage:', layerId);
    } catch (error) {
      console.error('Error removing layer from storage:', error);
    }
  };

  const clearAllStoredLayers = () => {
    try {
      localStorage.removeItem('persistentLayers');
      console.log('All stored layers cleared');
    } catch (error) {
      console.error('Error clearing stored layers:', error);
    }
  };

  //for risk checker 
  const handleRiskMode = () => {
    if (!isMapReady || !viewRef.current) {
      alert("Map is not ready.");
      return;
    }

    setIsRiskMode(true);
    viewRef.current.container.style.cursor = 'crosshair';
    alert("Click on the map to select a point for risk check.");
  };

  // Helper function to get color from layer
  const getLayerColor = (layer) => {
    if (layer.renderer && layer.renderer.symbol) {
      return layer.renderer.symbol.color;
    }
    return '#2196F3'; // Default color
  };

  // Helper function to render layer visual indicator
  const renderLayerIndicator = (layerItem) => {
    const color = getLayerColor(layerItem.layer);
    const colorStyle = typeof color === 'string' ? color : `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    if (layerItem.type === 'shoreline' || layerItem.type === 'predicted' && layerItem.layer.geometryType === 'polyline' || layerItem.type === 'uploaded' && layerItem.layer.geometryType === 'polyline') {
      // Render line indicator
      return (
        <div className="layer-indicator line-indicator" style={{ backgroundColor: color, height: 2 }}>
          <div className="line-sample" style={{ borderColor: colorStyle, borderStyle: layerItem.type === 'predicted' ? 'dashed' : 'solid' }}></div>
        </div>
      );
    } else if (layerItem.type === 'predicted' && layerItem.layer.geometryType === 'point' || layerItem.type === 'uploaded' && layerItem.layer.geometryType === 'point') {
      // Render point indicator
      return (
        <div className="layer-indicator point-indicator" style={{ backgroundColor: color }}>
          <div className="point-sample" style={{ backgroundColor: colorStyle }}></div>
        </div>
      );
    } else if (layerItem.type === 'predicted' && layerItem.layer.geometryType === 'polygon' || layerItem.type === 'uploaded' && layerItem.layer.geometryType === 'polygon') {
      // Render polygon indicator
      return (
        <div className="layer-indicator polygon-indicator" style={{ backgroundColor: color }}>
          <div className="polygon-sample" style={{ backgroundColor: colorStyle }}></div>
        </div>
      );
    }

    return null;
  };

  // Function to recreate layers from stored data (add this after the storage helper functions)
  const recreateLayersFromStorage = async () => {
    if (!isMapReady || !mapRef.current) {
      console.log('Map not ready, skipping layer recreation');
      return;
    }

    setIsLoadingPersistentLayers(true);
    const storedLayers = loadLayersFromStorage();

    if (storedLayers.length === 0) {
      setIsLoadingPersistentLayers(false);
      return;
    }

    try {
      const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);
      const recreatedLayers = [];

      for (const layerData of storedLayers) {
        try {
          let newLayer;

          if (layerData.type === 'uploaded') {
            // Recreate uploaded layer
            newLayer = new FeatureLayer({
              source: layerData.features,
              fields: layerData.fields,
              objectIdField: layerData.objectIdField,
              geometryType: layerData.geometryType,
              spatialReference: layerData.spatialReference,
              renderer: layerData.renderer,
              popupTemplate: layerData.popupTemplate
            });
          } else if (layerData.type === 'predicted') {
            // Recreate predicted layer
            newLayer = new FeatureLayer({
              source: layerData.features,
              fields: layerData.fields,
              objectIdField: layerData.objectIdField,
              geometryType: layerData.geometryType,
              spatialReference: layerData.spatialReference,
              renderer: layerData.renderer,
              popupTemplate: layerData.popupTemplate
            });
          }

          if (newLayer) {
            mapRef.current.add(newLayer);

            const layerItem = {
              id: layerData.id,
              name: layerData.name,
              layer: newLayer,
              visible: layerData.visible !== undefined ? layerData.visible : true,
              type: layerData.type
            };

            newLayer.visible = layerItem.visible;
            recreatedLayers.push(layerItem);

            console.log(`Recreated layer: ${layerData.name}`);
          }
        } catch (error) {
          console.error(`Error recreating layer ${layerData.name}:`, error);
        }
      }

      // Add recreated layers to the layers state
      if (recreatedLayers.length > 0) {
        setLayers(prevLayers => [...prevLayers, ...recreatedLayers]);
      }

    } catch (error) {
      console.error('Error recreating layers from storage:', error);
    } finally {
      setIsLoadingPersistentLayers(false);
    }
  };


  const handleFileUploaded = async (fileData) => {
    if (!isMapReady || !mapRef.current) {
      console.error("Map is not ready yet");
      return;
    }

    try {
      const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);

      let features = [];
      let geometryType = 'point';

      if (fileData.fileType === 'csv') {
        // Handle CSV data
        if (fileData.data.features) {
          features = fileData.data.features.map((feature, index) => ({
            geometry: {
              type: "point",
              x: feature.geometry.coordinates[0],
              y: feature.geometry.coordinates[1],
              spatialReference: { wkid: 32635 } // Assuming WGS84 for CSV
            },
            attributes: {
              ObjectID: Number(index + Date.now()), // Ensure number
              ...feature.properties
            }
          }));
        }
      } else {
        // Handle GeoJSON data
        const geojsonData = fileData.data;
        if (geojsonData.features && geojsonData.features.length > 0) {
          const firstFeature = geojsonData.features[0];
          const geojsonType = firstFeature.geometry.type.toLowerCase();
          if (geojsonType === 'linestring') {
            geometryType = 'polyline';
          } else if (geojsonType === 'point') {
            geometryType = 'point';
          } else if (geojsonType === 'polygon') {
            geometryType = 'polygon';
          } else {
            console.error("Unsupported geometry type:", geojsonType);
            alert("Unsupported geometry type: " + geojsonType);
            return;
          }

          features = geojsonData.features.map((feature, index) => {
            let geometry;

            if (geometryType === 'point') {
              geometry = {
                type: "point",
                x: feature.geometry.coordinates[0],
                y: feature.geometry.coordinates[1],
                spatialReference: { wkid: 32635 }
              };
            } else if (geometryType === 'polyline') {
              geometry = {
                type: "polyline",
                paths: [feature.geometry.coordinates],
                spatialReference: { wkid: 32635 }
              };
            } else if (geometryType === 'polygon') {
              geometry = {
                type: "polygon",
                rings: feature.geometry.coordinates,
                spatialReference: { wkid: 32635 }
              };
            }

            return {
              geometry,
              attributes: {
                ObjectID: Number(index + Date.now()), // Ensure number
                ...feature.properties
              }
            };
          });
        }
      }

      if (features.length === 0) {
        alert("No valid features found in the uploaded file");
        return;
      }

      // Create fields dynamically based on the first feature's attributes
      const sampleAttributes = features[0].attributes;
      const fields = [
        { name: "ObjectID", type: "oid" },
        ...Object.keys(sampleAttributes)
          .filter(key => key !== "ObjectID")
          .map(key => ({ name: key, type: "string" }))
      ];

      // Create renderer based on geometry type
      let renderer;
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      if (geometryType === 'point') {
        renderer = {
          type: "simple",
          symbol: {
            type: "simple-marker",
            color: randomColor,
            size: 8,
            style: "circle",
            outline: {
              color: "white",
              width: 1
            }
          }
        };
      } else if (geometryType === 'polyline') {
        renderer = {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: randomColor,
            width: 3
          }
        };
      } else if (geometryType === 'polygon') {
        renderer = {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [randomColor, 0.3], // Semi-transparent
            outline: {
              color: "black",
              width: 0.5
            }
          }
        };
      }

      const uploadedLayer = new FeatureLayer({
        source: features,
        fields: fields,
        objectIdField: "ObjectID",
        geometryType: geometryType,
        spatialReference: { wkid: 32635 },
        renderer: renderer,
        popupTemplate: {
          title: `Uploaded Layer: ${fileData.fileName}`,
          content: "File: " + fileData.fileName
        }
      });

      mapRef.current.add(uploadedLayer);

      // Add to layers state
      const newLayer = {
        id: `uploaded_${Date.now()}`,
        name: `${fileData.fileName}`,
        layer: uploadedLayer,
        visible: true,
        type: 'uploaded'
      };

      setLayers(prevLayers => [...prevLayers, newLayer]);

      const layerDataToSave = {
        id: newLayer.id,
        name: newLayer.name,
        type: newLayer.type,
        visible: newLayer.visible,
        features: features,
        fields: fields,
        objectIdField: "ObjectID",
        geometryType: geometryType,
        spatialReference: { wkid: 32635 },
        renderer: renderer,
        popupTemplate: {
          title: `Uploaded Layer: ${fileData.fileName}`,
          content: "File: " + fileData.fileName
        }
      };

      saveLayerToStorage(layerDataToSave);

      // Zoom to the uploaded layer
      uploadedLayer.when(() => {
        if (uploadedLayer.fullExtent) {
          viewRef.current.goTo(uploadedLayer.fullExtent.expand(1.5));
        }
      });

      console.log("Uploaded layer added successfully:", fileData.fileName);
    } catch (error) {
      console.error("Error adding uploaded layer:", error);
      alert("Error adding uploaded layer: " + error.message);
    }
  };

  // Function to handle map click and get coordinates
  const handleMapClick = async (event) => {
    if (isClickMode) {
      try {
        // Get the clicked point coordinates
        const clickedPoint = event.mapPoint;
        console.log("Clicked point:", clickedPoint);

        // Load required modules
        const [Graphic, projection, SpatialReference] = await loadModules([
          "esri/Graphic",
          "esri/geometry/projection",
          "esri/geometry/SpatialReference",
        ]);

        // Ensure projection engine is loaded
        await projection.load();

        // Create target spatial reference (EPSG:32635 - UTM Zone 35N)
        const targetSR = new SpatialReference({ wkid: 32635 });

        let finalPoint;

        // Check if the point is already in the target coordinate system
        if (clickedPoint.spatialReference.wkid === 32635) {
          finalPoint = clickedPoint;
        } else {
          // Project coordinates to the desired coordinate system (EPSG:32635)
          finalPoint = await projection.project(clickedPoint, targetSR);
        }

        if (!finalPoint) {
          throw new Error("Projection failed - result is null");
        }

        // Create the graphic AFTER we have the final point
        const pointGraphic = new Graphic({
          geometry: finalPoint,
          symbol: {
            type: "picture-marker",
            url: "https://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png",
            width: "24px",
            height: "24px"
          }
        });

        // Clear previous point and add the new graphic
        clickGraphicsLayerRef.current.removeAll();
        clickGraphicsLayerRef.current.add(pointGraphic);

        // Update the point data with the clicked coordinates
        setPointData(prevData => ({
          ...prevData,
          Current_Position_X: finalPoint.x.toFixed(2),
          Current_Position_Y: finalPoint.y.toFixed(2)
        }));

        // Exit click mode after getting coordinates
        setIsClickMode(false);

        // Change cursor back to default
        if (viewRef.current) {
          viewRef.current.container.style.cursor = 'default';
        }

        console.log(`Coordinates captured: X=${finalPoint.x.toFixed(2)}, Y=${finalPoint.y.toFixed(2)}`);
        console.log(`Original SR: ${clickedPoint.spatialReference.wkid}, Target SR: ${targetSR.wkid}`);

      } catch (error) {
        console.error("Error getting coordinates:", error);
        console.error("Error details:", error.message);

        // Fallback: try to use coordinates as-is if projection fails
        try {
          const clickedPoint = event.mapPoint;
          if (clickedPoint && clickedPoint.x !== undefined && clickedPoint.y !== undefined) {
            console.log("Using fallback coordinates (may need manual conversion)");
            setPointData(prevData => ({
              ...prevData,
              Current_Position_X: clickedPoint.x.toFixed(2),
              Current_Position_Y: clickedPoint.y.toFixed(2)
            }));

            // Exit click mode
            setIsClickMode(false);
            if (viewRef.current) {
              viewRef.current.container.style.cursor = 'default';
            }

            alert(`Coordinates captured (${clickedPoint.spatialReference.wkid || 'unknown CRS'}): X=${clickedPoint.x.toFixed(2)}, Y=${clickedPoint.y.toFixed(2)}\nNote: You may need to verify the coordinate system.`);
          } else {
            throw new Error("No valid coordinates available");
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          alert("Error getting coordinates. Please try again.");
        }
      }
    }
    // --------- Risk check mode ---------
  else if (isRiskMode) {
    const clickedPoint = event.mapPoint;

    const [geometryEngine, Point, Polyline, projection, SpatialReference] = await loadModules([
      "esri/geometry/geometryEngine",
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "esri/geometry/projection",
      "esri/geometry/SpatialReference"
    ]);

    await projection.load();

    let finalClickedPoint = clickedPoint;
    if (clickedPoint.spatialReference.wkid !== 32635) {
      const targetSR = new SpatialReference({ wkid: 32635 });
      finalClickedPoint = await projection.project(clickedPoint, targetSR);
    }

    let shortestDistance = Number.MAX_VALUE;

    const predictedLayers = layers.filter(l => l.type === 'predicted' && l.layer.geometryType === 'polyline');

    for (const layerItem of predictedLayers) {
      const features = layerItem.layer.source;

      for (const feature of features) {
        const polyline = new Polyline({
          paths: feature.geometry.paths,
          spatialReference: { wkid: 32635 }
        });

        const distance = geometryEngine.distance(finalClickedPoint, polyline, "meters");

        if (distance < shortestDistance) {
          shortestDistance = distance;
        }
      }
    }

    const distanceInMeters = shortestDistance;

    setReportData(prev => ({
      ...prev,
      riskChecks: [...prev.riskChecks, {
      
      distance: shortestDistance.toFixed(1),
      status:riskStatus,
      color: colors[Math.floor(Math.random() * colors.length)],
      timestamp: new Date()
      }]
      }));

    const riskStatus = distanceInMeters <= 200 ? 'High Risk'
      : distanceInMeters <= 500 ? 'Risky':distanceInMeters <= 1000 ? 'Low Risk'
      : 'Safe';

    alert(`📏 Distance to nearest predicted shoreline: ${distanceInMeters.toFixed(2)} m\nStatus: ${riskStatus}`);

    setIsRiskMode(false);
    viewRef.current.container.style.cursor = 'default';
  }
  };

  // Function to toggle click mode
  const toggleClickMode = () => {
    if (!isMapReady || !viewRef.current) {
      alert("Map is not ready yet. Please wait.");
      return;
    }

    const newClickMode = !isClickMode;
    setIsClickMode(newClickMode);

    if (newClickMode) {
      // Enable click mode - change cursor and show instruction
      viewRef.current.container.style.cursor = 'crosshair';
      alert("Click on the map to select coordinates for Current Position X and Y");
    } else {
      // Disable click mode - restore default cursor
      viewRef.current.container.style.cursor = 'default';
    }
  };

  useEffect(() => {
    if (mapDiv.current) {

      const initMap = async () => {
        try {
          const [Map, MapView, FeatureLayer] = await loadModules(
            ["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer"],
            { css: true }
          );

          const [GraphicsLayer] = await loadModules(["esri/layers/GraphicsLayer"]);

          const map = new Map({
            basemap: "osm"
          });

          // Store map reference
          mapRef.current = map;

          // Fetch shoreline data from your backend
          const response = await axios.get("http://localhost:25883/api/Coastline/segments");
          const featureCollection = response.data;

          const features = featureCollection.features
            .filter(feature => feature.geometry)
            .map(feature => {
              const parsedGeometry = JSON.parse(feature.geometry);
              return {
                geometry: {
                  type: "polyline",
                  paths: parsedGeometry.coordinates,
                  spatialReference: { wkid: 32635 }
                },
                attributes: {
                  ObjectID: feature.properties.id,
                  date: feature.properties.date,
                  uncertainty: feature.properties.uncertainty
                }
              };
            });

          const fields = [
            { name: "ObjectID", type: "oid" },
            { name: "date", type: "string" },
            { name: "uncertainty", type: "double" }
          ];

          const ShoreLineLayer = new FeatureLayer({
            source: features,
            fields: fields,
            objectIdField: "ObjectID",
            geometryType: "polyline",
            spatialReference: { wkid: 32635 },
            renderer: {
              type: "simple",
              symbol: {
                type: "simple-line",
                color: "#2196F3",
                width: 4,
              }
            },
            popupTemplate: {
              title: "Shoreline Segment",
              content: `
                <b>Date:</b> {date}<br/>
                <b>Uncertainty:</b> {uncertainty}
              `
            }
          });

          map.add(ShoreLineLayer);

          const clickGraphicsLayer = new GraphicsLayer();
          map.add(clickGraphicsLayer);


          clickGraphicsLayerRef.current = clickGraphicsLayer;

          // Store shoreline layer reference
          shorelineLayerRef.current = ShoreLineLayer;

          // Initialize layers state with the shoreline layer
          setLayers([{
            id: 'shoreline',
            name: 'Original Shoreline',
            layer: ShoreLineLayer,
            visible: true,
            type: 'shoreline'
          }]);

          // Set up map view
          const view = new MapView({
            container: mapDiv.current,
            map: map,
            center: [29.9187, 31.2001], // Alexandria, Egypt
            zoom: 10
          });

          // Store view reference
          viewRef.current = view;

          // Add click handler for coordinate selection
          const clickHandler = view.on("click", handleMapClick);
          clickHandlerRef.current = clickHandler;

          setIsMapReady(true); // Mark map as ready after initialization
          console.log("Map and view initialized successfully");
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      };

      initMap();
    }

    return () => {
      // Clean up click handler
      if (clickHandlerRef.current) {
        clickHandlerRef.current.remove();
      }

      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, []);

  // Update the click handler when click mode changes
  useEffect(() => {
    if (viewRef.current && clickHandlerRef.current) {
      // Remove existing handler
      clickHandlerRef.current.remove();

      // Add new handler
      clickHandlerRef.current = viewRef.current.on("click", handleMapClick);
    }
  }, [isClickMode, isRiskMode]);

  // Add this useEffect to load persistent layers when map is ready
  useEffect(() => {
    if (isMapReady && !isLoadingPersistentLayers) {
      console.log('Map is ready, loading persistent layers...');
      recreateLayersFromStorage();
    }
  }, [isMapReady]);

  const validatePointData = () => {
    const requiredFields = ['LRR', 'Sea_Level_Rise_Trend_mm_year', 'NSM',
      'Current_Position_X', 'Current_Position_Y',
      'Elevation', 'Coastal_Slope'];

    for (let field of requiredFields) {
      if (!pointData[field] || pointData[field].toString().trim() === '') {
        alert(`Please fill in the ${field} field`);
        return false;
      }
    }

    if (!pointYearToPredict) {
      alert('Please specify a year to predict');
      return false;
    }

    return true;
  };

  const handlePointPrediction = async () => {
    if (!isMapReady || !mapRef.current || !viewRef.current) {
      console.error("Map is not initialized yet. Please wait and try again.");
      return;
    }

    if (!validatePointData()) {
      return;
    }

    try {
      const [FeatureLayer] = await loadModules(["esri/layers/FeatureLayer"]);

      // Prepare the data payload
      const payload = {
        ...pointData,
        year: pointYearToPredict
      };

      console.log("Sending point prediction request with payload:", payload);

      const predictionRes = await axios.post("http://localhost:5000/predict_point", payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: "blob"
      });

      const geojsonText = await predictionRes.data.text();
      console.log("📦 Raw GeoJSON text for point prediction year", pointYearToPredict, ":", geojsonText);

      const geojson = JSON.parse(geojsonText);
      console.log("✅ Parsed GeoJSON features count:", geojson.features.length);
      console.log("✅ First feature geometry:", geojson.features[0]?.geometry);

      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const predictedFeatures = geojson.features.map((feature, index) => {
        console.log("Processing point feature", index, "coordinates:", feature.geometry.coordinates);
        return {
          geometry: {
            type: "point",
            x: feature.geometry.coordinates[0],
            y: feature.geometry.coordinates[1],
            spatialReference: { wkid: 32635 } // Use the same coordinate system as your other layers
          },
          attributes: {
            ObjectID: Number(index + Date.now()), // Ensure number
            year: Number(pointYearToPredict) // Ensure number
          }
        };
      });

      const predictedLayer = new FeatureLayer({
        source: predictedFeatures,
        objectIdField: "ObjectID",
        geometryType: "point",
        spatialReference: { wkid: 32635 }, // Match the coordinate system
        fields: [
          { name: "ObjectID", type: "oid" },
          { name: "year", type: "integer" }
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            color: randomColor,
            size: 12, // Make it larger so it's more visible
            style: "circle",
            outline: {
              color: "white",
              width: 2
            }
          }
        },
        popupTemplate: {
          title: "Predicted Point",
          content: `Predicted shoreline point for year ${pointYearToPredict}<br/>`
        }
      });

      // Use the stored map reference
      mapRef.current.add(predictedLayer);

      // Add to layers state
      const newLayer = {
        id: `predicted_point_${pointYearToPredict}_${Date.now()}`,
        name: `Predicted Point ${pointYearToPredict}`,
        layer: predictedLayer,
        visible: true,
        type: 'predicted'
      };

      setLayers(prevLayers => [...prevLayers, newLayer]);

      // Save layer data to storage for persistence
      const layerDataToSave = {
        id: newLayer.id,
        name: newLayer.name,
        type: newLayer.type,
        visible: newLayer.visible,
        features: predictedFeatures,
        fields: [
          { name: "ObjectID", type: "oid" },
          { name: "year", type: "integer" }
        ],
        objectIdField: "ObjectID",
        geometryType: "point",
        spatialReference: { wkid: 32635 },
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            color: randomColor,
            size: 12,
            style: "circle",
            outline: {
              color: "white",
              width: 2
            }
          }
        },
        popupTemplate: {
          title: "Predicted Point",
          content: `Predicted shoreline point for year ${pointYearToPredict}<br/>`
        }
      };

      saveLayerToStorage(layerDataToSave);

      // Zoom to the predicted layer
      predictedLayer.when(() => {
        if (predictedLayer.fullExtent) {
          viewRef.current.goTo(predictedLayer.fullExtent.expand(2));
        }
      });

      console.log("Point layer added to map. Layers count:", mapRef.current.layers.length);

      setReportData(prev => ({
        ...prev,
        predictedPoints: [
          ...prev.predictedPoints,
          ...predictedFeatures.map((f, index) => ({
            id: `${pointYearToPredict}_${index + 1}`,
            year: pointYearToPredict,
            x: f.geometry.x,
            y: f.geometry.y,
            color: randomColor,
            source: "prediction",
            timestamp: new Date(),
            inputData: { ...pointData }
          }))
        ]
      }));
    } catch (error) {
      console.error("Error loading predicted point:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        alert(`Error: ${error.response.data.error || 'Failed to predict point'}`);
      } else {
        alert('Failed to predict point. Please check your input data.');
      }
    }
  };

  // Update handlePredict to set isPredicted to true after successful prediction
  const handlePredict = async () => {
    if (!isMapReady || !mapRef.current || !viewRef.current) {
      console.error("Map is not initialized yet. Please wait and try again.");
      return;
    }
    if (!yearToPredict || isNaN(yearToPredict) || yearToPredict.trim() === '') {
      alert('Please enter a valid year');
      return;
    }
    try {
      const [FeatureLayer, Polyline] = await loadModules([
        "esri/layers/FeatureLayer",
        "esri/geometry/Polyline"
      ]);
      const predictionRes = await axios.post("http://localhost:5000/predict", { year: yearToPredict }, {
        responseType: "blob"
      });
      const geojsonText = await predictionRes.data.text();
      const geojson = JSON.parse(geojsonText);
      setPredictedShoreline(geojson); // <-- Save to context
      setIsPredicted(true); // <-- Enable Go to Assess Buildings button

      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const predictedFeatures = geojson.features.map((feature, index) => {
        console.log("Processing feature", index, "coordinates:", feature.geometry.coordinates);
        return {
          geometry: {
            type: "polyline",
            paths: feature.geometry.coordinates,
            spatialReference: { wkid: 32635 }
          },
          attributes: {
            ObjectID: index + Date.now(), // Unique ID using timestamp
            year: yearToPredict
          }
        };
      });

      const predictedLayer = new FeatureLayer({
        source: predictedFeatures,
        objectIdField: "ObjectID",
        geometryType: "polyline",
        spatialReference: { wkid: 32635 },
        fields: [
          { name: "ObjectID", type: "oid" },
          { name: "year", type: "integer" }
        ],
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: randomColor,
            width: 4,
            style: "dash"
          }
        },
        popupTemplate: {
          content: `Predicted shoreline for year ${yearToPredict}<br/>`
        }
      });

      // Use the stored map reference
      mapRef.current.add(predictedLayer);

      setReportData(prev => ({
      ...prev,
      predictedLines: [...prev.predictedLines, {
      year: yearToPredict,
      color: randomColor,
      timestamp: new Date()
      }]
      }));

      // Add to layers state
      const newLayer = {
        id: `predicted_${yearToPredict}_${Date.now()}`,
        name: `Predicted Line ${yearToPredict}`,
        layer: predictedLayer,
        visible: true,
        type: 'predicted'
      };

      setLayers(prevLayers => [...prevLayers, newLayer]);

      // Save layer data to storage for persistence
      const layerDataToSave = {
        id: newLayer.id,
        name: newLayer.name,
        type: newLayer.type,
        visible: newLayer.visible,
        features: predictedFeatures,
        fields: [
          { name: "ObjectID", type: "oid" },
          { name: "year", type: "integer" }
        ],
        objectIdField: "ObjectID",
        geometryType: "polyline",
        spatialReference: { wkid: 32635 },
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: randomColor,
            width: 4,
            style: "dash"
          }
        },
        popupTemplate: {
          content: `Predicted shoreline for year ${yearToPredict}<br/>`
        }
      };

      saveLayerToStorage(layerDataToSave);

      // Set isPredicted to true after successful prediction
      setIsPredicted(true);

      console.log("Layer added to map. Layers count:", mapRef.current.layers.length);

      // Ensure the view updates to show the new layer
      if (predictedLayer.fullExtent) {
        viewRef.current.goTo(predictedLayer.fullExtent).then(() => {
          console.log("View updated to layer extent:", predictedLayer.fullExtent);
        }).catch(err => console.error("Error updating view:", err));
      } else {
        console.warn("No valid extent for predicted layer");
        viewRef.current.goTo({ center: [29.9187, 31.2001], zoom: 10 });
      }

      console.log("✅ Predicted shoreline layer added for year", yearToPredict);
    } catch (error) {
      console.error("Error loading predicted shoreline:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.error || 'Failed to predict shoreline'}`);
      }
    }
  };

  // Add handleGoToBuildings function
  const handleGoToBuildings = () => {
    setPredictedYear(yearToPredict);
    localStorage.setItem("predictedYear", yearToPredict.toString());
    navigate(`/buildings/${yearToPredict}`);
  };

  const hasPredictedLine = layers.some(layer =>
    layer.type === 'predicted' && layer.layer.geometryType === 'polyline'
  )

  const toggleLayerVisibility = (layerId) => {
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          const newVisible = !layer.visible;
          layer.layer.visible = newVisible;
          return { ...layer, visible: newVisible };
        }
        return layer;
      })
    );
  };


  const removeLayer = (layerId) => {
    setLayers(prevLayers => {
      const layerToRemove = prevLayers.find(layer => layer.id === layerId);
      if (layerToRemove && (layerToRemove.type === 'predicted' || layerToRemove.type === 'uploaded')) {
        // Remove from map
        mapRef.current.remove(layerToRemove.layer);

        // Remove from storage
        removeLayerFromStorage(layerId);

        return prevLayers.filter(layer => layer.id !== layerId);
      }
      return prevLayers;
    });
  };

  // Add this function to handle clearing all layers
  const clearAllLayers = () => {
    if (window.confirm('Are you sure you want to clear all uploaded and predicted layers?')) {
      // Remove from map first
      layers.forEach(layer => {
        if (layer.type === 'predicted' || layer.type === 'uploaded') {
          mapRef.current?.remove(layer.layer);
        }
      });

      // Clear from storage (if this is defined elsewhere)
      clearAllStoredLayers?.();

      // Update React state — keep only shoreline
      setLayers(prevLayers =>
        prevLayers.filter(layer => layer.type === 'shoreline')
      );
    }
  };

  return (
    <div>
      <div className="typing-container">
        <div className="typing-content">
          <div className="text-cont">
            <h1>
              {typeEffect}
              <span className="cursor">|</span>
            </h1>
          </div>
        </div>
      </div>
      <div className="point-form-container">
        <h3 className="point-form-heading">Predict a Coastal Point</h3>
        <div className="point-form-grid">
          {Object.keys(pointData).map((key) => {
            if (key === 'Current_Position_X' || key === 'Current_Position_Y') {
              return (
                <div key={key} className="input-wrapper">
                  <input
                    type="number"
                    step="any"
                    placeholder={key.replace(/_/g, ' ')}
                    value={pointData[key]}
                    onChange={(e) => setPointData({ ...pointData, [key]: e.target.value })}
                    required
                    className="form-input"
                  />
                  {key === 'Current_Position_Y' && (
                    <button
                      type="button"
                      onClick={toggleClickMode}
                      className={`map-select-button ${isClickMode ? 'cancel-mode' : 'select-mode'}`}
                      title={isClickMode ? 'Cancel coordinate selection' : 'Select coordinates on map'}
                    >
                      {isClickMode ? 'Cancel' : '📍 Map Select'}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={key} className="input-wrapper">
                <input
                  type="number"
                  step="any"
                  placeholder={key.replace(/_/g, ' ')}
                  value={pointData[key]}
                  onChange={(e) => setPointData({ ...pointData, [key]: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
            );
          })}
          <div className="input-wrapper">
            <input
              type="number"
              placeholder="Year to Predict"
              value={pointYearToPredict}
              onChange={(e) => setPointYearToPredict(e.target.value)}
              className="form-input"
            />
          </div>
          <button
            onClick={handlePointPrediction}
            disabled={!isMapReady}
            className="predict-action-button"
          >
            Predict Point
          </button>
          {isClickMode && (
            <div className="click-mode-alert">
              🌊 Click the map to capture coordinates
            </div>
          )}
        </div>
      </div>

      {/* Line Prediction Form */}
      <h3 className="point-form-heading">Generate Shoreline Prediction</h3>
      <div className="parent-container">

        <input
          type="number"
          className="input"
          placeholder="Which year do you want to predict?"
          value={yearToPredict}
          onChange={(e) => setYearToPredict(e.target.value)}
        />
        <button className="styled-button" onClick={handlePredict} disabled={!isMapReady}>
          Generate Line
        </button>
        <button
          className="styled-button"
          onClick={handleGoToBuildings}
          disabled={!isPredicted}
        >
        Dashboard          
        </button>
      </div>

      <div className="main-content">
        <div className="control-container">
          {showLayerPanel && (
            <div className="sidebar">
              <div className="sidebar-header">
                <h3>Layer Control</h3>
                <span className="layer-count">{layers.length} layers</span>
              </div>
              <div className="sidebar-actions">
                <button
                  onClick={clearAllLayers}
                  className="clear-all-btn"
                  style={{
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '10px'
                  }}
                >
                  Clear All Layers
                </button>
              </div>
              <div className="layer-list">
                {layers.map(layer => (
                  <div key={layer.id} className="layer-item">
                    <div className="layer-info">
                      <label className="layer-checkbox">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => toggleLayerVisibility(layer.id)}
                        />
                        <span className="checkmark"></span>
                        <div className="layer-details">
                          <div className="layer-name-container">
                            <span className="layer-name">{layer.name}</span>
                            {renderLayerIndicator(layer)}
                          </div>
                          <span className={`layer-type ${layer.type}`}>
                            {layer.type === 'shoreline' ? '📍 Base Layer' :
                              layer.type === 'uploaded' ? '📁 Uploaded Layer' :
                                ' Prediction'}
                          </span>
                        </div>
                      </label>
                    </div>
                    <div className="layer-actions">
                      <LayerDownloadButton
                        layerItem={layer}
                        isDownloading={false}
                        onDownload={DownloadSingleLayer}
                      />

                      {(layer.type === 'predicted' || layer.type === 'uploaded') && (
                        <button
                          onClick={() => removeLayer(layer.id)}
                          className="remove-layer-btn"
                          title="Remove layer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="map-container">
          <div className="controls">
            <button onClick={() => setShowLayerPanel(!showLayerPanel)}>
              <FontAwesomeIcon icon={showLayerPanel ? faEyeSlash : faEye} />
            </button>
            <FileUploadComponent onFileUploaded={handleFileUploaded} />
          </div>
          <div className="controls2">
            {hasPredictedLine && (
              <button
                onClick={handleRiskMode}
                className="Risk-btn"
                disabled={!isMapReady}
              >
                Risk Checker
              </button>
            )}
          </div>
          <div ref={mapDiv} className="map-div" style={{ cursor: isClickMode ? 'crosshair' : 'default' }} />
        </div>
      </div>
    </div>
  );
}

export default Prediction;