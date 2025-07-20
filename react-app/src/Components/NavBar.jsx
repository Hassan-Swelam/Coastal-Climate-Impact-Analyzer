import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        </li>
        <li>
          <Link to="/cvi" className={location.pathname === '/cvi' ? 'active' : ''}>CVI</Link>
        </li>
        <li>
          <Link to="/timeseries" className={location.pathname === '/timeseries' ? 'active' : ''}>Time Series</Link>
        </li>
        <li>
          <Link to="/prediction" className={location.pathname === '/prediction' ? 'active' : ''}>Prediction</Link>
        </li>
        <li>
          <Link to="/report" className={location.pathname === '/report' ? 'active' : ''}>Report</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
