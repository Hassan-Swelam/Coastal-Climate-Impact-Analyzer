// src/utils/leaflet-esri-setup.js
import L from 'leaflet';

// Attach L to window BEFORE importing esri-leaflet
if (typeof window !== 'undefined') {
  window.L = L;
}

require('esri-leaflet'); // ✅ Use require here so it runs after window.L is defined
