import { useEffect, useState } from 'react';
import ApiDataViewer from './components/ApiDataViewer';
import ApiStarMap from './components/ApiStarMap';
import LoadingModal from './components/LoadingModal';
import ViewToggle from './components/ViewToggle'; // <-- 1. Import the new component

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // --- 2. Add state to manage the current view ---
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'data'

  useEffect(() => {
    const wakeUpApi = async () => {
      setModalMessage("[{--- CONNECTING TO GALACTIC CARTOGRAPHY MAINFRAME ---}]");
      setIsModalOpen(true);
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

  return (
    <div className="bg-black w-fill h-fill relative"> {/* Added relative positioning */}
      {/* --- 3. Add the toggle button --- */}
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {/* --- 4. Conditionally render the active component --- */}
      {viewMode === 'map' ? <ApiStarMap /> : <ApiDataViewer />}

      <LoadingModal isOpen={isModalOpen} message={modalMessage} />
    </div>
  );
};

export default App;
