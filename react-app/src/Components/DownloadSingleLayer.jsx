// Function to download a single layer
const DownloadSingleLayer = async (layerItem) => {
  try {
    // Convert layer features to GeoJSON
    const features = [];
    
    // Query all features from the layer
    const query = layerItem.layer.createQuery();
    query.returnGeometry = true;
    query.outFields = ['*'];
    
    const featureSet = await layerItem.layer.queryFeatures(query);
    
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
      name: layerItem.name,
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:32635'
        }
      },
      features: features
    };
    
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
    
    console.log(`Downloaded ${layerItem.name}`);
    
  } catch (error) {
    console.error('Error downloading layer:', error);
    alert(`Error downloading ${layerItem.name}`);
  }
};

export default DownloadSingleLayer