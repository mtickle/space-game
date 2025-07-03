// App.jsx
import StarMap from '@components/StarMap';
import SystemView from '@components/SystemView';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLazyStarField } from './hooks/useLazyStarField';

const App = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const stars = useLazyStarField({
    offsetX,
    offsetY,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    scale,
  });

  return (
    <div className="bg-black w-fill h-fill">
      <Routes>
        <Route
          path="/"
          element={
            <StarMap
              stars={stars}
              offsetX={offsetX}
              setOffsetX={setOffsetX}
              offsetY={offsetY}
              setOffsetY={setOffsetY}
              scale={scale}
              setScale={setScale}
              setCanvasSize={setCanvasSize}
            />
          }
        />
        <Route path="/system/:starName" element={<SystemView stars={stars} />} />
      </Routes>
    </div>
  );
};

export default App;
