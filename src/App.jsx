import { useEffect, useState } from 'react';
import ApiDataViewer from './components/ApiDataViewer';
import ApiStarMap from './components/ApiStarMap';
import LoadingModal from './components/LoadingModal';
import ViewToggle from './components/ViewToggle';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [viewMode, setViewMode] = useState('map');

  useEffect(() => {
    const wakeUpApi = async () => {
      setModalMessage("CONNECTING TO GALACTIC CARTOGRAPHY MAINFRAME");
      setIsModalOpen(true);

      const startTime = Date.now();
      const minDisplayTime = 3000; // 3 seconds minimum display time

      try {
        const apiKey = import.meta.env.VITE_API_KEY;
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/about/`, {
          headers: { 'x-api-key': apiKey }
        });
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        //console.log('API is awake!', data);
      } catch (error) {
        console.error('Error waking up API:', error);
        setModalMessage('Could not connect to the API.');
        // Ensure error message also shows for a minimum time
        setTimeout(() => setIsModalOpen(false), minDisplayTime);
        return;
      }

      // Calculate how long the API call took
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minDisplayTime - elapsedTime;

      // Wait for the remaining time before closing the modal
      if (remainingTime > 0) {
        setTimeout(() => setIsModalOpen(false), remainingTime);
      } else {
        setIsModalOpen(false);
      }
    };
    wakeUpApi();
  }, []);

  return (
    <div className="bg-black w-screen h-screen relative">
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      {viewMode === 'map' ? <ApiStarMap /> : <ApiDataViewer />}
      <LoadingModal isOpen={isModalOpen} message={modalMessage} />
    </div>
  );
};

export default App;

