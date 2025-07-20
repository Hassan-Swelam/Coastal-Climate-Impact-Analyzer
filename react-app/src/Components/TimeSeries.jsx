import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import BaseMap from './BaseMap';
import Navbar from './NavBar';

const TimeSeries = () => {
    const [shorelines, setShorelines] = useState({});
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:25883/api/TimeSeries").then(res => {
            const grouped = res.data.reduce((acc, item) => {
                const year = item.year;
                const geo = {
                    type: "Feature",
                    geometry: JSON.parse(item.geometry),
                    properties: { id: item.id, year }
                };
                acc[year] = acc[year] || [];
                acc[year].push(geo);
                return acc;
            }, {});
            setShorelines(grouped);
        });
    }, []);

    useEffect(() => {
        let interval = null;
        if (playing) {
            interval = setInterval(() => {
                setCurrentYearIndex(prev => {
                    const years = Object.keys(shorelines).sort();
                    return (prev + 1) % years.length;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [playing, shorelines]);

    const sortedYears = Object.keys(shorelines).sort();

    return (
        <div style={{ position: "relative" }}>
            <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <Navbar />
            <MapContainer center={[31.06, 29.7]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <BaseMap />
                {sortedYears.length > 0 && (
                    <GeoJSON
                        key={currentYearIndex}
                        data={{
                            type: "FeatureCollection",
                            features: shorelines[sortedYears[currentYearIndex]]
                        }}
                        style={{ color: "blue", weight: 4 }}
                    />
                )}
            </MapContainer>
            </div>
            {/* Persistent playback controls */}
            <div style={{
                position: "absolute",
                bottom: 200,
                left: '42%',
                zIndex: 1200,
                background: "#fff",
                padding: "10px",
                borderRadius: "8px"
                }}>
                <button onClick={() => setPlaying(!playing)}>
                    {playing ? "⏸" : "▶"}
                </button>
                {sortedYears.length > 0 && (
                    <>
                        <input
                            type="range"
                            min={0}
                            max={sortedYears.length - 1}
                            value={currentYearIndex}
                            onChange={(e) => setCurrentYearIndex(Number(e.target.value))}
                        />
                        <span>{sortedYears[currentYearIndex]}</span>
                    </>
                )}
            </div>
        </div>
    );

};

export default TimeSeries;
