import React from 'react';
import RadarVisualization from './components/RadarVisualization';
import RadarConfig from './components/RadarConfig';

const App = () => {
  return (
    <div>
      <RadarVisualization RadarConfig={RadarConfig} />
    </div>
  );
};

export default App;
