import React from 'react';
import './Report.css';

function Report({ reportData }) {
  return (
    <div className="report-page">
      <h2>📊 Project Summary Report</h2>

      <section className="report-section">
        <h3>📈 Predicted Shorelines</h3>
        {reportData.predictedLines.length ? (
          <table className="report-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Color</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {reportData.predictedLines.map((line, index) => (
                <tr key={index}>
                  <td>{line.year}</td>
                  <td>
                    <span className="color-box" style={{ backgroundColor: line.color }}></span> {line.color}
                  </td>
                  <td>{new Date(line.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="empty-message">No predicted shorelines yet.</p>}
      </section>

      <section className="report-section">
      <h3>Predicted Points</h3>
      {reportData.predictedPoints.length === 0 ? (
      <p>No predicted points available yet.</p>
      ) : (
      <table className="report-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Year</th>
            <th>X</th>
            <th>Y</th>
            <th>LRR</th>
            <th>SLR Trend</th>
            <th>NSM</th>
            <th>Elevation</th>
            <th>Current X</th>
            <th>Current Y</th>
            <th>Slope</th>
            <th>Color</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
              {reportData.predictedPoints.length === 0 ? (
      <tr>
        <td colSpan="13">No predicted points yet</td>
      </tr>
      ) : (
          reportData.predictedPoints.map((point, index) => (
            <tr key={index}>
          <td>{point.id}</td>
          <td>{point.year}</td>
          <td>{point.x.toFixed(3)}</td>
          <td>{point.y.toFixed(3)}</td>
          <td>{point.inputData?.LRR || '—'}</td>
          <td>{point.inputData?.Sea_Level_Rise_Trend_mm_year || '—'}</td>
          <td>{point.inputData?.NSM || '—'}</td>
          <td>{point.inputData?.Elevation || '—'}</td>
          <td>{point.inputData?.Current_Position_X || '—'}</td>
          <td>{point.inputData?.Current_Position_Y || '—'}</td>
          <td>{point.inputData?.Coastal_Slope || '—'}</td>
          <td>
            <div style={{
                    backgroundColor: point.color,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}></div></td>
              <td>{new Date(point.timestamp).toLocaleString()}</td>
            </tr>
          ))
      )}</tbody>
      </table>
    )}</section>

      <section className="report-section">
        <h3>🛡️ Risk Checks</h3>
        {reportData.riskChecks.length ? (
          <table className="report-table">
            <thead>
              <tr>
                <th>Distance (m)</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {reportData.riskChecks.map((risk, index) => (
                <tr key={index}>
                  <td>{risk.distance}</td>
                  <td>{risk.status}</td>
                  <td>{new Date(risk.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="empty-message">No risk checks performed yet.</p>}
      </section>
      <section className="report-section">
              {reportData.bufferStats && (
        <div className="report-section">
          <h3>📏 Buffer & Intersected Buildings Summary</h3>
          <table className="report-table">
            <tbody>
              <tr>
                <th>Intersected Buildings</th>
                <td>{reportData.bufferStats.intersectedBuildingCount}</td>
              </tr>
              <tr>
                <th>Buffer Area (m²)</th>
                <td>{reportData.bufferStats.bufferAreaSqMeters.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Buffer Area (Hectares)</th>
                <td>{reportData.bufferStats.bufferAreaHectares}</td>
              </tr>
              <tr>
                <th>Bounding Box (minX, minY)</th>
                <td>{reportData.bufferStats.boundingBox.minX}, {reportData.bufferStats.boundingBox.minY}</td>
              </tr>
              <tr>
                <th>Bounding Box (maxX, maxY)</th>
                <td>{reportData.bufferStats.boundingBox.maxX}, {reportData.bufferStats.boundingBox.maxY}</td>
              </tr>
              <tr>
                <th>Timestamp</th>
                <td>{new Date(reportData.bufferStats.timestamp).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
     )}

      </section>

      <section className="report-section">
        <h3>🌊 Proposed Coastal Adaptation Solutions</h3>
        <div className="solutions-list">
          <p><b>1️⃣ Comprehensive Coastal Zone Development</b><br />
            Strengthen and develop the entire 60 km Alexandria coastline to improve long-term resilience against erosion and sea-level rise.
          </p>
          <p><b>2️⃣ Beach Nourishment & Sand Dune Expansion</b><br />
            Expand and reinforce the sandy shoreline buffer to naturally absorb wave energy and reduce coastal flooding.
          </p>
          <p><b>3️⃣ Installation of Offshore Breakwaters</b><br />
            Construct engineered wave breakers to protect vulnerable sections of the coast from high-energy storm surges.
          </p>
          <p><b>4️⃣ Sand Dune Plantation & Stabilization</b><br />
            Plant and maintain artificial sand dunes to act as natural barriers, enhancing coastal defense and biodiversity.
          </p>
          <p><b>5️⃣ Foundation Reinforcement Technologies</b><br />
            Apply specialized concrete injection techniques to stabilize building foundations in flood-prone zones — a costly but critical option for protecting key urban assets.
          </p>
        </div>
      </section>
      <button className="print-button" onClick={() => window.print()}>
  🖨️ Print Report
      </button>

    </div>
    
  );
}

export default Report;
