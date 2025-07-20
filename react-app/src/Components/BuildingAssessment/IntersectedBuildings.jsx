// // IntersectedBuildings.jsx
// import React, { useEffect, useState } from 'react';
// import { GeoJSON } from 'react-leaflet';
// import * as turf from '@turf/turf';
// import axios from 'axios';

// const IntersectedBuildings = ({ bufferGeoJson }) => {
//   const [intersected, setIntersected] = useState(null);

//   useEffect(() => {
//     const fetchAndIntersect = async () => {
//       if (!bufferGeoJson) {
//         console.warn('⛔ No bufferGeoJson passed');
//         setIntersected(null);
//         return;
//       }

//       console.log("🧠 bufferGeoJson passed to IntersectedBuildings:", bufferGeoJson);

//       try {
//         const response = await axios.get(
//           'https://services2.arcgis.com/NYP47KhmyPanSbgo/arcgis/rest/services/Buildings_features_checked1/FeatureServer/57/query',
//           {
//             params: {
//               where: '1=1',
//               outFields: '*',
//               f: 'geojson',
//               outSR: 4326,
//             },
//           }
//         );

//         const buildings = response.data;
//         console.log("🏢 Fetched buildings count:", buildings.features.length);

//         const intersectedFeatures = buildings.features
//           .filter(f => f.geometry)
//           .filter((feature) => {
//             try {
//               const building = turf.feature(feature.geometry);
//               const buffer = turf.feature(bufferGeoJson.geometry);
//               return turf.booleanIntersects(buffer, building);
//             } catch (e) {
//               console.error("❌ Error testing feature intersection:", e);
//               return false;
//             }
//           });

//         console.log("✅ Intersected buildings count:", intersectedFeatures.length);

//         setIntersected({
//           type: 'FeatureCollection',
//           features: intersectedFeatures,
//         });


//       } catch (error) {
//         console.error('❌ Failed to fetch or intersect buildings:', error);
//       }
//     };

//     fetchAndIntersect();
//   }, [bufferGeoJson]);

//   if (!intersected) return null;

//   return (
//    <GeoJSON
//       key={Date.now()} 
//       data={intersected}
//       style={() => ({
//         color: 'yellow',
//         weight: 3,
//         fillOpacity: 0.7,
//         opacity: 1
//       })}
//       onEachFeature={(feature, layer) => {
//         layer.bindPopup(/* ... */);
//       }}
//     />

//   );
// };

// export default React.memo(IntersectedBuildings);

import React, { useState, useEffect, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import * as turf from '@turf/turf';
import axios from 'axios';

const IntersectedBuildings = ({ bufferGeoJson, onAtRiskCount }) => {
  const [intersected, setIntersected] = useState(null);

  const fetchAndIntersect = useCallback(async () => {
    if (!bufferGeoJson) {
      console.warn('⛔ No bufferGeoJson passed');
      setIntersected(null);
      if (onAtRiskCount) onAtRiskCount(0);
      return;
    }

    try {
      const response = await axios.get(
        'https://services2.arcgis.com/NYP47KhmyPanSbgo/arcgis/rest/services/Buildings_features_checked1/FeatureServer/57/query',
        {
          params: {
            where: '1=1',
            outFields: '*',
            f: 'geojson',
            outSR: 4326,
          },
        }
      );

      const buildings = response.data;
      const intersectedFeatures = buildings.features
        .filter(f => f.geometry)
        .filter((feature) => {
          try {
            const building = turf.feature(feature.geometry);
            const buffer = turf.feature(bufferGeoJson.geometry);
            return turf.booleanIntersects(buffer, building);
          } catch (e) {
            console.error("❌ Intersection error:", e);
            return false;
          }
        })
        .map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            atRisk: true,
          }
        }));

      setIntersected({
        type: 'FeatureCollection',
        features: intersectedFeatures,
      });

      if (onAtRiskCount) onAtRiskCount(intersectedFeatures.length);
    } catch (error) {
      console.error('❌ Failed to fetch buildings:', error);
      if (onAtRiskCount) onAtRiskCount(0);
    }
  }, [bufferGeoJson, onAtRiskCount]);

  useEffect(() => {
    fetchAndIntersect();
  }, [fetchAndIntersect]);

  if (!intersected) return null;

  return (
    <GeoJSON
      data={intersected}
      style={() => ({
        color: '#FFD700',
        weight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.6,
        opacity: 1,
      })}
      onEachFeature={(feature, layer) => {
        const { BLDG_TYPE, HEIGHT } = feature.properties;
        layer.bindPopup(`
          <strong>Building Type:</strong> ${BLDG_TYPE || 'Unknown'}<br/>
          <strong>Height:</strong> ${HEIGHT ? `${HEIGHT} m` : 'Unknown'}<br/>
          <strong>Status:</strong> At Risk
        `);

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 3, fillOpacity: 0.8 });
          },
          mouseout: (e) => {
            e.target.setStyle({ weight: 2, fillOpacity: 0.6 });
          }
        });
      }}
    />
  );
};

export default React.memo(IntersectedBuildings);
