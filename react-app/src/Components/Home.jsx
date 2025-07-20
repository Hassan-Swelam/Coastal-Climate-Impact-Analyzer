import alex from '../assets/Alex.jpg';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-background">
          <img src={alex} alt="Coastal landscape" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Coastal Vulnerability Assessment and Prediction System
            </h1>
            <p className="hero-subtitle">
              Science-based insights for sustainable coastal development
            </p>
          </div>
        </div>
      </div>

      <section className="main-content">
        <div className="content-wrapper">
          <div className="description-card">
            <h2 className="section-title">Advanced Coastal Risk Assessment</h2>
            <p className="description-text">
              Our web-based decision support tool is designed to identify and assess coastal areas at risk from sea level rise and unplanned urbanization. By combining GIS-based flood mapping, historical shoreline data (1986–2023), and AI-driven shoreline prediction models, the platform offers interactive maps and forecasting tools to visualize coastal vulnerability over time.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Coastal Vulnerability Index</h3>
              <p className="feature-description">
                Explore comprehensive CVI analysis to assess risks to buildings and infrastructure with detailed vulnerability mapping.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔮</div>
              <h3 className="feature-title">Predictive Modeling</h3>
              <p className="feature-description">
                Predict future shoreline positions based on user-input data and advanced AI-driven prediction models.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3 className="feature-title">Interactive Mapping</h3>
              <p className="feature-description">
                Access location-specific risk checks with interactive maps and visualization tools for comprehensive analysis.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Data Management</h3>
              <p className="feature-description">
                Upload and download data seamlessly, generate detailed reports for informed decision-making processes.
              </p>
            </div>
          </div>

          <div className="cta-section">
            <h3 className="cta-title">Empowering Sustainable Coastal Development</h3>
            <p className="cta-description">
              This solution empowers planners, researchers, and decision-makers to support sustainable coastal development and disaster preparedness through science-based insights.
            </p>
            <button className="cta-button">Get Started</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;