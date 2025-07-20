import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AssessBuildings from './Components/BuildingAssessment/AssessBuildings';
import Prediction from './Components/Prediction';
import TimeSeries from './Components/TimeSeries';
import CVI from './Components/CVI';
import Navbar from './Components/NavBar';
import Layout from './Components/Layout';
import { PredictionYearProvider } from './PredictionYearContext';
import { PredictedShorelineProvider } from './PredictedShorelineContext';
import Home from './Components/Home';
import Report from './Components/Report';

function App() {
  const [reportData, setReportData] = useState({
  predictedLines: [],
  predictedPoints: [],
  riskChecks: [],
  bufferStats: null  
});
  return (
    <Router>
      <PredictionYearProvider>
        <PredictedShorelineProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="cvi" element={<CVI />} />
              <Route path="timeseries" element={<TimeSeries />} />
              <Route path="/prediction" element={<Prediction setReportData={setReportData}/>} />
              <Route path="buildings/:year" element={<AssessBuildings />} />
              <Route path="/report" element={<Report reportData={reportData} />} />
            </Route>
          </Routes>
        </PredictedShorelineProvider>
      </PredictionYearProvider>
    </Router>
  );
}

export default App;