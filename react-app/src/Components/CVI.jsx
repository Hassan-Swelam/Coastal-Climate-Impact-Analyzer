import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import BaseMap from './BaseMap';

const CVI = () => {
  const [CVIBefore, setCVIBefore] = useState(null);
  const [CVIAfter, setCVIAfter] = useState(null);
  const [showBefore, setShowBefore] = useState(true);
  const [showAfter, setShowAfter] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:25883/api/cvi/before")
      .then(res => {
        const features = res.data.map(item => ({
          type: "Feature",
          geometry: JSON.parse(item.geometry_B),
          properties: {
            id: item.id_B,
            cviRank: item.cviRank_B
          }
        }));
        setCVIBefore({ type: "FeatureCollection", features });
      })
      .catch(err => console.error("CVI Before error", err));

    axios.get("http://localhost:25883/api/cvi/after")
      .then(res => {
        const features = res.data.map(item => ({
          type: "Feature",
          geometry: JSON.parse(item.geometry_A),
          properties: {
            id: item.id_A,
            cviRank: item.cviRank_A
          }
        }));
        setCVIAfter({ type: "FeatureCollection", features });
      })
      .catch(err => console.error("CVI After error", err));
  }, []);

  const getColorByCVI = (rank) => {
    if (rank === 1) return '#2DC937';
    if (rank === 2) return '#99C140';
    if (rank === 3) return '#E7B416';
    if (rank === 4) return '#DB7B2B';
    if (rank === 5) return '#CC3232';
    return '#999999';
  };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 100px)', width: '100%' }}>
      {/* Map container must be full height of parent */}
      <MapContainer center={[31.1, 29.8]} zoom={10.4} style={{ height: '100vh', width: '100%', zIndex: 0 }}>
        <BaseMap />
        {showBefore && CVIBefore && (
          <GeoJSON
            data={CVIBefore}
            style={(feature) => ({
              color: getColorByCVI(feature.properties.cviRank),
              weight: 8,
              opacity: 0.9
            })}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`Before<br>CVI Rank: ${feature.properties.cviRank}`);
            }}
          />
        )}
        {showAfter && CVIAfter && (
          <GeoJSON
            data={CVIAfter}
            style={(feature) => ({
              color: getColorByCVI(feature.properties.cviRank),
              weight: 8,
              opacity: 0.9
            })}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`After<br>CVI Rank: ${feature.properties.cviRank}`);
            }}
          />
        )}
      </MapContainer>

      {/* TOC */}
      <div style={{
        position: "absolute", top: 250, left: 200, zIndex: 1000,
        background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 0 5px rgba(0,0,0,0.2)"
      }}>
        <label><input type="checkbox" checked={showAfter} onChange={() => setShowAfter(!showAfter)} /> CVI After</label><br />
        <label><input type="checkbox" checked={showBefore} onChange={() => setShowBefore(!showBefore)} /> CVI Before</label>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 200, left: 200, zIndex: 1000,
        background: "white", padding: "10px", borderRadius: "8px", boxShadow: "0 0 5px rgba(0,0,0,0.3)"
      }}>
        <strong>CVI Rank</strong>
        <div><span style={{ background: '#2DC937', width: 16, height: 16, display: 'inline-block', marginRight: 6 }}></span> Rank 1 (Very Low)</div>
        <div><span style={{ background: '#99C140', width: 16, height: 16, display: 'inline-block', marginRight: 6 }}></span> Rank 2 (Low)</div>
        <div><span style={{ background: '#E7B416', width: 16, height: 16, display: 'inline-block', marginRight: 6 }}></span> Rank 3 (Moderate)</div>
        <div><span style={{ background: '#DB7B2B', width: 16, height: 16, display: 'inline-block', marginRight: 6 }}></span> Rank 4 (High)</div>
        <div><span style={{ background: '#CC3232', width: 16, height: 16, display: 'inline-block', marginRight: 6 }}></span> Rank 5 (Very High)</div>
      </div>
    </div>
  );
};

export default CVI;
