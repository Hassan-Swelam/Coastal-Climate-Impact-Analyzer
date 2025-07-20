import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';

const LayerDownloadComponent = ({ layers, mapRef, onClearAllLayers }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Function to convert layer features to GeoJSON
  const convertLayerToGeoJSON = async (layer, layerName) => {
    try {
      const features = [];
      
      // Query all features from the layer
      const query = layer.createQuery();
      query.returnGeometry = true;
      query.outFields = ['*'];
      
      const featureSet = await layer.queryFeatures(query);
      
      // Convert features to GeoJSON format
      featureSet.features.forEach((feature) => {
        let geometry;
        
        // Handle different geometry types
        if (feature.geometry.type === 'point') {
          geometry = {
            type: 'Point',
            coordinates: [feature.geometry.x, feature.geometry.y]
          };
        } else if (feature.geometry.type === 'polyline') {
          geometry = {
            type: 'LineString',
            coordinates: feature.geometry.paths[0] || []
          };
        } else if (feature.geometry.type === 'polygon') {
          geometry = {
            type: 'Polygon',
            coordinates: feature.geometry.rings || []
          };
        }
        
        // Create GeoJSON feature
        const geoJsonFeature = {
          type: 'Feature',
          geometry: geometry,
          properties: { ...feature.attributes }
        };
        
        features.push(geoJsonFeature);
      });
      
      // Create GeoJSON FeatureCollection
      const geoJson = {
        type: 'FeatureCollection',
        name: layerName,
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:32635'
          }
        },
        features: features
      };
      
      return geoJson;
    } catch (error) {
      console.error(`Error converting layer ${layerName} to GeoJSON:`, error);
      throw error;
    }
  };

  // Function to download a single layer
  const downloadLayer = async (layerItem) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(`Converting ${layerItem.name} to GeoJSON...`);
      
      const geoJson = await convertLayerToGeoJSON(layerItem.layer, layerItem.name);
      
      setDownloadProgress(`Preparing download for ${layerItem.name}...`);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(geoJson, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layerItem.name.replace(/\s+/g, '_')}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadProgress(`✅ Downloaded ${layerItem.name}`);
      setTimeout(() => setDownloadProgress(''), 2000);
      
    } catch (error) {
      console.error('Error downloading layer:', error);
      setDownloadProgress(`❌ Error downloading ${layerItem.name}`);
      setTimeout(() => setDownloadProgress(''), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to download all layers
  const downloadAllLayers = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress('Preparing all layers for download...');
      
      const downloadPromises = layers.map(async (layerItem, index) => {
        setDownloadProgress(`Converting ${layerItem.name} (${index + 1}/${layers.length})...`);
        
        const geoJson = await convertLayerToGeoJSON(layerItem.layer, layerItem.name);
        
        // Create individual download
        const blob = new Blob([JSON.stringify(geoJson, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${layerItem.name.replace(/\s+/g, '_')}.geojson`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      
      await Promise.all(downloadPromises);
      
      setDownloadProgress(`✅ Downloaded all ${layers.length} layers`);
      setTimeout(() => setDownloadProgress(''), 3000);
      
    } catch (error) {
      console.error('Error downloading all layers:', error);
      setDownloadProgress('❌ Error downloading layers');
      setTimeout(() => setDownloadProgress(''), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="download-component">
      <div className="download-controls">
        <button
          onClick={downloadAllLayers}
          disabled={isDownloading || layers.length === 0}
          className="download-btn"
          title="Download All Layers"
        >
          <FontAwesomeIcon icon={isDownloading ? faSpinner : faDownload} 
                           className={isDownloading ? 'spinning' : ''} />
          Download All
        </button>
        
        <button
          onClick={onClearAllLayers}
          disabled={isDownloading || layers.length === 0}
          className="download-btn clear-all-btn"
          title="Clear All Layers"
        >
          <FontAwesomeIcon icon={faTrash} />
          Clear All
        </button>
      </div>
      
      {downloadProgress && (
        <div className="download-progress">
          {downloadProgress}
        </div>
      )}
      
      <div className="download-info">
        <small>Layers will be downloaded as GeoJSON files</small>
      </div>
    </div>
  );
};

// Individual layer download button component
export const LayerDownloadButton = ({ layerItem, isDownloading, onDownload }) => {
  return (
    <button
      onClick={() => onDownload(layerItem)}
      disabled={isDownloading}
      className="layer-download-btn"
      title={`Download ${layerItem.name}`}
    >
      <FontAwesomeIcon icon={isDownloading ? faSpinner : faDownload} 
                       className={isDownloading ? 'spinning' : ''} />
      {isDownloading ? '' : ''}
    </button>
  );
};

export default LayerDownloadComponent;