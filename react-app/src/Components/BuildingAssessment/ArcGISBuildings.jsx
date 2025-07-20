import { useEffect } from 'react';
import { featureLayer } from 'esri-leaflet';
import { useMap } from 'react-leaflet';



const ArcGISBuildings = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const layer = featureLayer({
      url: 'https://services2.arcgis.com/NYP47KhmyPanSbgo/arcgis/rest/services/Buildings_features_checked1/FeatureServer/57',
      style: {
        color: '#0078A8',
        weight: 1,
        fillOpacity: 0.4,
      },
      onEachFeature: (feature, layer) => {
        const { BLDG_TYPE, HEIGHT } = feature.properties || {};
        layer.bindPopup(`
          <b>Type:</b> ${BLDG_TYPE || 'N/A'}<br/>
          <b>Height:</b> ${HEIGHT ?? 'N/A'} m
        `);
      },
    });

    layer.addTo(map);
    return () => map.removeLayer(layer);
  }, [map]);

  return null;
};

export default ArcGISBuildings;
