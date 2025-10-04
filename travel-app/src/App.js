import React, { useRef } from 'react';
import UltraRealisticGlobe from './UltraRealisticGlobe_old';

function App() {
  const globeRef = useRef();

  return (
    <div className="App">
      <UltraRealisticGlobe ref={globeRef} />
    </div>
  );
}

export default App;
