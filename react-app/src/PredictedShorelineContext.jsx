import React, { createContext, useContext, useState } from 'react';

const PredictedShorelineContext = createContext();

export function PredictedShorelineProvider({ children }) {
  const [predictedShoreline, setPredictedShoreline] = useState(null);
  return (
    <PredictedShorelineContext.Provider value={{ predictedShoreline, setPredictedShoreline }}>
      {children}
    </PredictedShorelineContext.Provider>
  );
}

export function usePredictedShoreline() {
  return useContext(PredictedShorelineContext);
}
