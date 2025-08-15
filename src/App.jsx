
import { useEffect, useState } from 'react';
import ApiStarMap from './components/ApiStarMap.jsx';
import LoadingModal from './components/LoadingModal';
//import { useLazyStarField } from './hooks/useLazyStarField';

const App = () => {

  //--- This hook wakes up the API when the app loads.
  //--- It shows a loading modal while the API is being woken up.
  //--- If the API is unreachable, it will show an error message in the modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
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
  //--- End API wake-up logic

  return (
    <div className="bg-black w-fill h-fill">
      <ApiStarMap />
      <LoadingModal isOpen={isModalOpen} message={modalMessage} />
    </div>

  );
};

export default App;
