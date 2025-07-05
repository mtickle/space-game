// App.jsx
import StarMap from '@components/StarMap';
import { useState } from 'react';
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
    </div>
  );
};

export default App;
