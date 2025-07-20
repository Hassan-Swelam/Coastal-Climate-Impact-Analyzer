// src/PredictionYearContext.jsx
import { createContext, useContext, useState } from 'react';

const PredictionYearContext = createContext();

export const PredictionYearProvider = ({ children }) => {
  const [predictedYear, setPredictedYear] = useState(null);
  return (
    <PredictionYearContext.Provider value={{ predictedYear, setPredictedYear }}>
      {children}
    </PredictionYearContext.Provider>
  );
};

export const usePredictionYear = () => useContext(PredictionYearContext);
