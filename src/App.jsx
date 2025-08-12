
import { useEffect, useState } from 'react';
import ApiStarMap from './components/ApiStarMap.jsx';
import LoadingModal from './components/LoadingModal';
//import { useLazyStarField } from './hooks/useLazyStarField';

const App = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const wakeUpApi = async () => {
      setModalMessage("Waking up the API because I'm cheap... 😴");
      setIsModalOpen(true);

      try {
        const apiKey = import.meta.env.VITE_API_KEY;
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        const response = await fetch(`${baseUrl}/api/about/`, {
          headers: { 'x-api-key': apiKey }
        });

        // ✅ SANITY CHECK: Was the HTTP request successful?
        if (!response.ok) {
          // Throw an error to be caught by the catch block
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API is awake!', data);

      } catch (error) {
        console.error('Error waking up API:', error);
        setModalMessage('Could not connect to the API.');
        setTimeout(() => setIsModalOpen(false), 3000);
        return;
      }

      setIsModalOpen(false);
    };

    wakeUpApi();
  }, []);



  //--- These are all things we need for moving along the canvas.
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  //--- This hook generates a lazy-loaded star field based on the current offset and scale.
  // const stars = useLazyStarField({
  //   offsetX,
  //   offsetY,
  //   canvasWidth: canvasSize.width,
  //   canvasHeight: canvasSize.height,
  //   scale,
  // });

  return (
    <div className="bg-black w-fill h-fill">
      <ApiStarMap />
      <LoadingModal isOpen={isModalOpen} message={modalMessage} />
    </div>

  );
};

export default App;
