// App.jsx
//import StarMap from '@components/StarMap';
// import { genesisGenerateGalaxy } from '@utils/genesis';
import { useState } from 'react';
import ApiStarMap from './components/ApiStarMap.jsx';
import { useLazyStarField } from './hooks/useLazyStarField';

// if (import.meta.env.DEV) {
//   window.genesisGenerateGalaxy = genesisGenerateGalaxy;
// }

const App = () => {

  //--- These are all things we need for moving along the canvas.
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  //--- This hook generates a lazy-loaded star field based on the current offset and scale.
  const stars = useLazyStarField({
    offsetX,
    offsetY,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    scale,
  });

  return (
    <div className="bg-black w-fill h-fill">
      <ApiStarMap
        stars={stars}
        offsetX={offsetX}
        setOffsetX={setOffsetX}
        offsetY={offsetY}
        setOffsetY={setOffsetY}
        scale={scale}
        setScale={setScale}
        setCanvasSize={setCanvasSize}
      />
    </div>
  );
};

export default App;
