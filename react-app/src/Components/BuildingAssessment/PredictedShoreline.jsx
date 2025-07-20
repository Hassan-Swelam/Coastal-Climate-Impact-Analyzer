import { useState, useEffect } from 'react';
import { useMap, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import * as turf from '@turf/turf';
import deepEqual from 'fast-deep-equal';
import * as turfProj from '@turf/projection';
import proj4 from 'proj4';


const PredictedShoreline = ({ year, bufferDistance, onBufferReady, onBoundsReady, geojson }) => {
  const map = useMap();
  // Only use state for fetched data
  const [fetchedGeoJson, setFetchedGeoJson] = useState(null);
  const [bufferGeoJson, setBufferGeoJson] = useState(null);


  // Fetch from backend only if geojson prop is not provided
  useEffect(() => {
    if (!geojson && year) {
      const fetchShoreline = async () => {
        try {
          const response = await axios.post('http://localhost:5000/predict', { year }, { responseType: 'json' });
          setFetchedGeoJson(response.data);
        } catch (error) {
          console.error('❌ Failed to fetch predicted shoreline:', error);
        }
      };
      fetchShoreline();
    }
  }, [geojson, year]);

  // Helper to ensure GeoJSON is in WGS84
  function ensureWGS84(geojson) {
    // If already WGS84, return as is
    if (
      geojson &&
      (geojson.crs === undefined ||
        geojson.crs?.properties?.name === 'urn:ogc:def:crs:OGC:1.3:CRS84' ||
        geojson.crs?.properties?.name === 'EPSG:4326' ||
        geojson.features?.[0]?.geometry?.coordinates?.[0]?.length === 2 &&
        geojson.features?.[0]?.geometry?.type &&
        geojson.features?.[0]?.geometry?.type.match(/Point|LineString|Polygon/)
      )
    ) {
      return geojson;
    }
    // Assume UTM Zone 35N (EPSG:32635) if not WGS84
    // Project to WGS84
    try {
      return turfProj.toWgs84(geojson, 35, true); // true = northern hemisphere
    } catch (e) {
      console.warn('Could not reproject to WGS84:', e);
      return geojson;
    }
  }

  // Helper to reproject all coordinates in a GeoJSON FeatureCollection from UTM 35N to WGS84
  function reprojectFeatureCollectionToWGS84(geojson) {
    if (!geojson || !geojson.features) return geojson;
    // Define projections
    const utm35n = '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs';
    const wgs84 = 'EPSG:4326';
    // Helper for coordinates
    function reprojectCoords(coords) {
      if (typeof coords[0] === 'number') {
        return proj4(utm35n, wgs84, coords);
      } else {
        return coords.map(reprojectCoords);
      }
    }
    // Deep clone and reproject
    const out = JSON.parse(JSON.stringify(geojson));
    out.features = out.features.map(f => {
      if (f.geometry && f.geometry.coordinates) {
        f.geometry.coordinates = reprojectCoords(f.geometry.coordinates);
      }
      return f;
    });
    // Remove CRS property to avoid confusion
    delete out.crs;
    return out;
  }

  // Use the correct geojson for display and buffer
  let displayGeoJsonRaw = geojson && geojson.features && geojson.features.length > 0 ? geojson : fetchedGeoJson;
  // If CRS is UTM, reproject to WGS84
  let displayGeoJson = displayGeoJsonRaw;
  if (displayGeoJsonRaw && displayGeoJsonRaw.crs && displayGeoJsonRaw.crs.properties?.name?.includes('32635')) {
    displayGeoJson = reprojectFeatureCollectionToWGS84(displayGeoJsonRaw);
  }

  // Calculate buffer and bounds only when displayGeoJson or bufferDistance changes
  useEffect(() => {
    if (displayGeoJson && displayGeoJson.features && displayGeoJson.features.length > 0) {
      // Bounds
      if (onBoundsReady) {
        const bbox = turf.bbox(displayGeoJson);
        onBoundsReady(bbox);
      }
      // Buffer
      if (bufferDistance > 0) {
        const buffer = turf.buffer(displayGeoJson.features[0], bufferDistance / 1000, { units: 'kilometers' });
        if (!deepEqual(buffer, bufferGeoJson)) {
          setBufferGeoJson(buffer);
          if (onBufferReady) onBufferReady(buffer);
        }
      } else {
        if (bufferGeoJson !== null) {
          setBufferGeoJson(null);
          if (onBufferReady) onBufferReady(null);
        }
      }
    }
  }, [displayGeoJson, bufferDistance]);

  if (!displayGeoJson) return null;

  return (
    <>
      <GeoJSON
        data={displayGeoJson}
        style={{ color: 'orange', weight: 2 }}
        onEachFeature={(feature, layer) => {
          layer.bindPopup(`Predicted Shoreline<br/><b>Year:</b> ${year}`);
        }}
      />
      {bufferGeoJson && (
        <GeoJSON
          data={bufferGeoJson}
          style={{ color: 'red', fillOpacity: 0.2 }}
        />
      )}
    </>
  );
};

export default PredictedShoreline;

