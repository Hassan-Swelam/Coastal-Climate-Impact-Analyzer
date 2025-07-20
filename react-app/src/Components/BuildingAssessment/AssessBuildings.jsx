import { usePredictionYear } from '../../PredictionYearContext';
import { usePredictedShoreline } from '../../PredictedShorelineContext';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { useLocation, useParams } from 'react-router-dom'; // Added useLocation for potential future use
import IntersectedBuildings from './IntersectedBuildings';
import 'leaflet/dist/leaflet.css';
import BaseMap from '../BaseMap';
import PredictedShoreline from './PredictedShoreline';
import ArcGISBuildings from './ArcGISBuildings';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './AssessBuildings.css';

const COLORS = ['#0088FE', '#FF8042']; // Blue for safe, red for at-risk


const AssessBuildings = () => {
  const { year: routeYear } = useParams();
  const { predictedYear, setPredictedYear } = usePredictionYear();
  const { predictedShoreline } = usePredictedShoreline();
  const [year, setYear] = useState(predictedYear || routeYear || 2025);
  const [bufferDistance, setBufferDistance] = useState('');
  const [appliedBuffer, setAppliedBuffer] = useState(null);
  const [layerKey, setLayerKey] = useState(0);
  const [bufferGeoJson, setBufferGeoJson] = useState(null);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const [atRiskBuildings, setAtRiskBuildings] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    if (predictedYear && !routeYear) {
      setYear(predictedYear);
    }
  }, [predictedYear, routeYear]);

  const handleBoundsReady = useCallback((bbox) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(
        [[bbox[1], bbox[0]], [bbox[3], bbox[2]]],
        { padding: [10, 10], maxZoom: 18 }
      );
    }
  }, []);

  const handleApplyBuffer = useCallback(() => {
    const parsed = parseFloat(bufferDistance);
    if (!isNaN(parsed) && parsed > 0) {
      setAppliedBuffer(parsed);
      setLayerKey(prev => prev + 1);
    } else {
      setAppliedBuffer(null);
      setBufferGeoJson(null);
    }
  }, [bufferDistance]);

  useEffect(() => {
    if (bufferGeoJson && appliedBuffer) {
      const total = 2000; // Placeholder; replace with actual data
      setTotalBuildings(total);
      // atRiskBuildings will be set by IntersectedBuildings
    } else {
      setTotalBuildings(0);
      setAtRiskBuildings(0);
    }
  }, [bufferGeoJson, appliedBuffer, year]);

  const chartData = useMemo(() => [
    { name: 'Safe Buildings', value: totalBuildings - atRiskBuildings },
    { name: 'At Risk Buildings', value: atRiskBuildings }
  ], [totalBuildings, atRiskBuildings]);

  const comparisonData = useMemo(() => [
    { name: 'High Impact Areas', value: atRiskBuildings * 10 },
    { name: 'Low Impact Areas', value: (totalBuildings - atRiskBuildings) * 2 }
  ], [totalBuildings, atRiskBuildings]);

  const impactEstimate = atRiskBuildings > 0
    ? "Egypt will need $2B to $7B USD to address projected impacts on the coastal zone."
    : "No estimated damage at this buffer distance.";

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    setPredictedYear(newYear);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Building Risk Assessment</h1>
      <div className="map-stats-container">
        <div className="map-section">
          <MapContainer
            center={[31.2, 29.9]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => {
              mapRef.current = map;
              if (!map.getPane('highlightPane')) {
                const pane = map.createPane('highlightPane');
                pane.style.zIndex = 999;
                pane.style.pointerEvents = 'none';
              }
            }}
          >
            <BaseMap />
            <ArcGISBuildings />
            {year && (
              <PredictedShoreline
                key={layerKey}
                year={year}
                bufferDistance={appliedBuffer || 0}
                onBufferReady={setBufferGeoJson}
                onBoundsReady={handleBoundsReady}
                geojson={predictedShoreline}
              />
            )}
            {bufferGeoJson && (
              <IntersectedBuildings
                bufferGeoJson={bufferGeoJson}
                key={`intersected-${layerKey}`}
                onAtRiskCount={(count) => setAtRiskBuildings(count)}
              />
            )}
          </MapContainer>
          <div className="controls-3">
            <label>
              Prediction Year:
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="buffer-input"
                placeholder="Year of Peridiction"
              />
            </label>
            <label>
              Risk Zone (meters):
              <input
                type="number"
                value={bufferDistance}
                onChange={(e) => setBufferDistance(e.target.value)}
                className="buffer-input"
                placeholder="Enter buffer distance in meters"
              />
            </label>
            <button onClick={handleApplyBuffer} className="apply-button" disabled={!bufferDistance}>
              Apply
            </button>
          </div>
        </div>
        <div className="stats-charts-container">
          <div className="stats-section">
            <h2>Assessment Statistics</h2>
            <div className="stat-item">
              <span className="stat-label">Total Buildings:</span>
              <span className="stat-value">{totalBuildings.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">At-Risk Buildings:</span>
              <span className="stat-value" style={{ color: atRiskBuildings > 0 ? '#dc3545' : '#28a745' }}>
                {atRiskBuildings.toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Risk Percentage:</span>
              <span className="stat-value" style={{ color: atRiskBuildings > 0 ? '#dc3545' : '#28a745' }}>
                {totalBuildings > 0 ? ((atRiskBuildings / totalBuildings) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Buffer Distance:</span>
              <span className="stat-value">{appliedBuffer || 'N/A'} meters</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prediction Year:</span>
              <span className="stat-value">{year}</span>
            </div>
            <div className="impact-estimate">
              <strong>Impact Estimate:</strong><br />
              {impactEstimate}
            </div>
          </div>
          <div className="charts-section">
            <div className="chart-container">
              <h3>Building Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-container">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[1] }}></div>
                  <span>At Risk ({atRiskBuildings})</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[0] }}></div>
                  <span>Safe ({totalBuildings - atRiskBuildings})</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <h3>Impact Assessment</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={comparisonData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${value}`}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-container">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[0] }}></div>
                  <span>High Impact</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: COLORS[1] }}></div>
                  <span>Low Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessBuildings;